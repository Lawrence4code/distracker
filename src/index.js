import database from './firebase';
import './styles.scss';

// dom elements
const btns = document.querySelectorAll('button');
const form = document.querySelector('form');
const formAct = document.querySelector('form span');
const input = document.querySelector('input');
const error = document.querySelector('.error');

let activity = 'cycling';

btns.forEach(btn => {
  btn.addEventListener('click', e => {
    activity = btn.dataset.activity;
    btns.forEach(btn => {
      btn.classList.remove('active');
      e.target.classList.add('active');
      input.setAttribute('id', activity);

      formAct.textContent = activity;
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
console.log(
  '2) Optional, add animation when button (done) and text are clicked make it smooth'
);
