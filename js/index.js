"use strict";

require('d3-html');
const d3 = require('d3-selection');

function header(body)
{
  container(body).H1('Timer')
}

function modes(body, state)
{
  body = container(body);
  body.H2('Mode');
  const mode = body.Select().Options({
    international: 'International Speech Contest',
    evaluation: 'Evaluation Contest',
    humerous: 'Humerous Speech Contest',
    tableTopics: 'Table Topics Contest',
    tallTale: 'Tall Tale Contest',
    custom: 'Custom',
  });

  const timeRange = body.Table().Tr();
  const start = timeRange.Td();
  start.H3('Start');
  const startMin = start.Select().Options(range(0, 99)).Border('0');
  start.Span(':')
  const startSec = start.Select().Options(range(0, 59)).Border('0');
  timeRange.Td().Span(' to ')
  const end = timeRange.Td();
  end.H3('End')
  const endMin = end.Select().Options(range(0, 99)).Border('0');
  end.Span(':')
  const endSec = end.Select().Options(range(0, 59)).Border('0');

  mode.Value(state.mode = state.mode || 'international');

  mode.OnChange(() =>
  {
    state.mode = mode.Value();

    switch(state.mode)
    {
      case 'international':
      case 'humerous':
        state.startMin = 5;
        state.startSec = 0;
        state.endMin = 7;
        state.endSec = 0;
        break;
      case 'evaluation':
        state.startMin = 2;
        state.startSec = 0;
        state.endMin = 3;
        state.endSec = 0;
        break;
      case 'tableTopics':
        state.startMin = 1;
        state.startSec = 0;
        state.endMin = 2;
        state.endSec = 0;
        break;
      case 'tallTale':
        state.startMin = 3;
        state.startSec = 0;
        state.endMin = 5;
        state.endSec = 0;
        break;
      default:
        state.startMin = state.startMin || 5;
        state.startSec = state.startSec || 0;
        state.endMin = state.endMin || 7;
        state.endSec = state.endSec || 0;
    }

    startMin.OnChange(() => state.startMin = startMin.Value()).Value(state.startMin);
    startSec.OnChange(() => state.startSec = startSec.Value()).Value(state.startSec);
    endMin.OnChange(() => state.endMin = endMin.Value()).Value(state.endMin);
    endSec.OnChange(() => state.endSec = endSec.Value()).Value(state.endSec);

    if (state.mode === 'custom')
    {
      startMin.Disabled(null)
      startSec.Disabled(null)
      endMin.Disabled(null)
      endSec.Disabled(null)
    }
    else
    {
      startMin.Disabled(true)
      startSec.Disabled(true)
      endMin.Disabled(true)
      endSec.Disabled(true)
    }

  })
  mode.OnChange()();
}

function timer(body, state)
{
  let inner = container(body);
  state.state = state.state || 'Stopped';
  state.startTime = state.startTime || Date.now();
  state.stopTime = state.stopTime || state.startTime;

  const display = inner.Div();
  const controls = inner.Div();

  function step()
  {
    display.clear();
    display.H3(state.state);

    const duration = ((state.state === 'Stopped'? state.stopTime : Date.now()) - state.startTime);

    display.Span(formatDuration(duration));

    const green = (parseInt(state.startMin) * 60 + parseInt(state.startSec)) * 1000;
    const red = (parseInt(state.endMin) * 60 + parseInt(state.endSec)) * 1000;
    const orange = (red + green) / 2;

    if (duration >= red)
    {
      body.Background('red')
      inner.BackgroundColor('red')
    }
    else if (duration >= orange)
    {
      body.Background('orange')
      inner.BackgroundColor('orange')
    }
    else if (duration >= green)
    {
      body.Background('green')
      inner.BackgroundColor('green')
    }
    else
    {
      body.Background('')
      inner.BackgroundColor('')
    }

    window.requestAnimationFrame(step);
  }
  window.requestAnimationFrame(step);

  function button()
  {
    controls.clear();
    if (state.state === 'Running')
    {
      controls.Button('Stop').OnClick(() =>
      {
        state.state = 'Stopped';
        state.stopTime = Date.now();
        controls.clear();
        setTimeout(button, 500);
      });
    }
    else
    {
      if (state.stopTime > state.startTime)
      {
        controls.Button('Resume').OnClick(() =>
        {
          state.state = 'Running';
          state.startTime = Date.now() - (state.stopTime - state.startTime);
          controls.clear();
          setTimeout(button, 500);
        });
        controls.Button('Reset').OnClick(() =>
        {
          state.stopTime = state.startTime;
          controls.clear();
          setTimeout(button, 50);
        });
        controls.Br();
        // const nameControl = controls.Input().Placeholder('Name');
        //
        // const duration = (state.stopTime - state.startTime) / 1000;
        // const durationMinutes = Math.floor(duration / 60);
        // const durationSeconds = Math.floor(duration - durationMinutes * 60);
        // const durationSubSeconds = (duration - durationMinutes * 60 - durationSeconds).toFixed(3).substr(1);
        //
        // controls.Span(` ${durationMinutes}:${(durationSeconds<10? '0' : '') + durationSeconds} ${durationSubSeconds} `)
        // controls.Button('Record').OnClick(() =>
        // {
        //   const name = nameControl.Value();
        //   const start = state.start;
        //   const duration = state.stopTime - state.startTime;
        //   let records = [];
        //   try
        //   {
        //     records = JSON.parse(state.records);
        //   }
        //   catch(e)
        //   {
        //   }
        //   records.push({name, start, duration});
        //   state.records = JSON.stringify(records);
        //   showRecords();
        // });
      }
      else
      {
        controls.Button('Start').OnClick(() =>
        {
          state.state = 'Running';
          state.start = state.startTime = Date.now()
          state.stopTime = 0;
          controls.clear();
          setTimeout(button, 500);
        });
      }
    }
  }

  button();
}

window.onload = function()
{
  const body = d3.select('body');
  const state = localStorage;
  header(body, state);
  modes(body, state);
  timer(body, state);
};

function container(body)
{
  return body.Div().Class('container');
}

function range(start, number)
{
  const options = {

  };
  for (let x = start; x <= number; x++)
  {
    if (x < 10)
    {
      options[x] = '0' + x;
    }
    else
    {
      options[x] = x;
    }
  }
  return options;
}

function formatDuration(duration)
{

  duration /= 1000;

  const durationMinutes = Math.floor(duration / 60);
  const durationSeconds = Math.floor(duration - durationMinutes * 60);
  const durationSubSeconds = (duration - durationMinutes * 60 - durationSeconds).toFixed(3).substr(1);

  return `${durationMinutes}:${(durationSeconds<10? '0' : '') + durationSeconds} ${durationSubSeconds}`;
}
