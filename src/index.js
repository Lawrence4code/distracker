import database from './firebase';
import * as d3 from 'd3';
import './styles.scss';

const margin = { top: 5, right: 20, bottom: 50, left: 100 };
const graphWidth = 560 - margin.left - margin.right;
const graphHeight = 360 - margin.top - margin.bottom;

const svg = d3
  .select('.canvas')
  .append('svg')
  .attr('width', graphWidth + margin.left + margin.right)
  .attr('height', graphHeight + margin.top + margin.bottom);

const graph = svg
  .append('g')
  .attr('width', graphWidth)
  .attr('height', graphHeight)
  .attr('transform', `translate(${margin.left}, ${margin.top})`);

// scales

const x = d3.scaleTime().range([0, graphWidth]);
const y = d3.scaleLinear().range([graphHeight, 0]);

const xAxisGroup = graph
  .append('g')
  .attr('class', 'x-axis')
  .attr('transform', `translate(0, ${graphHeight})`);

const yAxisGroup = graph.append('g').attr('class', 'y-axis');

// d3 line path generator
const line = d3
  .line()
  .x(function(d) {
    return x(new Date(d.date));
  })
  .y(function(d) {
    return y(d.distance);
  });

// line path element

const path = graph.append('path');

// create a dotted line and append that to graph
const dottedLine = graph
  .append('g')
  .attr('class', 'lines')
  .style('opacity', 0);

// create x dotted line and append to dotted line group
const xDottedLine = dottedLine
  .append('line')
  .attr('stroke', '#aaa')
  .attr('stroke-width', 1)
  .attr('stroke-dasharray', 4);

// create y dotted line and append to dotted line group
const yDottedLine = dottedLine
  .append('line')
  .attr('stroke', '#aaa')
  .attr('stroke-width', 1)
  .attr('stroke-dasharray', 4);

var update = data => {
  // filtering the data based on button click and specific activity
  data = data.filter(item => item.activity === activity);

  // sort data based on date
  data.sort((a, b) => new Date(a.date) - new Date(b.date));

  // set scale domain
  x.domain(d3.extent(data, d => new Date(d.date)));
  y.domain([0, d3.max(data, d => d.distance)]);

  // update path data

  path
    .data([data])
    .attr('fill', 'none')
    .attr('stroke', '#00bfa5')
    .attr('stroke-width', 2)
    .attr('d', line);

  // create circle
  const circles = graph.selectAll('circle').data(data);

  // remove unwanted points

  circles.exit().remove();

  // update current point
  circles
    .attr('r', 5)
    .attr('cx', d => x(new Date(d.date)))
    .attr('cy', d => y(d.distance))
    .attr('fill', '#ccc');

  // add new point
  circles
    .enter()
    .append('circle')
    .attr('r', 4)
    .attr('cx', d => x(new Date(d.date)))
    .attr('cy', d => y(d.distance))
    .attr('fill', '#ccc');

  // point hover animation

  graph
    .selectAll('circle')
    .on('mouseover', (d, i, n) => {
      d3.select(n[i])
        .transition()
        .duration(100)
        .attr('r', 6)
        .transition('fill', 'white');

      xDottedLine
        .attr('x1', x(new Date(d.date)))
        .attr('x2', x(new Date(d.date)))
        .attr('y1', graphHeight)
        .attr('y2', y(d.distance));

      yDottedLine
        .attr('x1', 0)
        .attr('x2', x(new Date(d.date)))
        .attr('y1', y(d.distance))
        .attr('y2', y(d.distance));

      dottedLine.style('opacity', 1);
    })
    .on('mouseleave', (d, i, n) => {
      d3.select(n[i])
        .transition()
        .duration(100)
        .attr('r', 4)
        .transition('fill', 'white');

      dottedLine.style('opacity', 0);
    });

  // create axis
  const xAxis = d3
    .axisBottom(x)
    .ticks(4)
    .tickFormat(d3.timeFormat('%b %d'));
  const yAxis = d3
    .axisLeft(y)
    .ticks(4)
    .tickFormat(d => d + 'm');

  // call axis
  xAxisGroup.call(xAxis);
  yAxisGroup.call(yAxis);
  // rotate axis

  xAxisGroup
    .selectAll('text')
    .attr('transform', 'rotate(-40)')
    .attr('text-anchor', 'end');
};

let data = [];

database
  .collection('activities')
  .orderBy('date')
  .onSnapshot(res => {
    res.docChanges().forEach(change => {
      const doc = { ...change.doc.data(), id: change.doc.id };

      switch (change.type) {
        case 'added':
          data.push(doc);
          break;
        case 'modifed':
          const index = data.findIndex(item => item.id === doc.id);
          data[index] = doc;
          break;
        case 'removed':
          data = data.filter(item => item.id !== doc.id);
          break;
        default:
          break;
      }
    });

    update(data);
  });

// JS dom related code

// dom elements
const btns = document.querySelectorAll('button');
const form = document.querySelector('form');
const formAct = document.querySelector('form span');
const input = document.querySelector('input');
const error = document.querySelector('.error');

var activity = 'cycling';

btns.forEach(btn => {
  btn.addEventListener('click', e => {
    activity = btn.dataset.activity;
    btns.forEach(btn => {
      btn.classList.remove('active');
      e.target.classList.add('active');
      input.setAttribute('id', activity);

      formAct.textContent = activity;

      // call update function to update the specific activity in the dom
      update(data);
    });
  });
});

// form submit

form.addEventListener('submit', e => {
  e.preventDefault();

  const distance = parseInt(input.value);

  if (distance) {
    database
      .collection('activities')
      .add({ distance, activity, date: new Date().toString() })
      .then(() => {
        (error.textContent = ''), (input.value = '');
      });
  } else {
    error.textContent = 'Please enter a valid input (Distance in meters)';
  }
});

console.log('******* Issue to Fix *******');
console.log(
  '1) Slight delay in res from firebase results in input data staying in the input field and multiple enter results in duplicate records, fix it!'
);
console.log('2) Why saparate graph.js did not work, find the reason!!!');
