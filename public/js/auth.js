
// COMPLETE PROFILE FRONTEND JAVASCRIPT

document.getElementById('role').addEventListener('change', function() {
  const studentTypeDiv = document.getElementById('studentTypeDiv');
  const gradeDiv = document.getElementById('gradeDiv');
  const studentType = document.getElementById('studentType');
  const grade = document.getElementById('grade');

  if (this.value === 'Student') {
    studentTypeDiv.style.display = 'block';
    studentType.required = true;
  } else {
    studentTypeDiv.style.display = 'none';
    gradeDiv.style.display = 'none';
    studentType.required = false;
    grade.required = false;
  }
});

document.getElementById('studentType').addEventListener('change', function() {
  const gradeDiv = document.getElementById('gradeDiv');
  const grade = document.getElementById('grade');

  if (this.value === 'High School') {
    gradeDiv.style.display = 'block';
    grade.required = true;
  } else {
    gradeDiv.style.display = 'none';
    grade.required = false;
  }
});


// REGISTER FRONTEND JAVASCRIPT

document.getElementById('role').addEventListener('change', function() {
  const studentTypeDiv = document.getElementById('studentTypeDiv');
  const gradeDiv = document.getElementById('gradeDiv');
  const studentType = document.getElementById('studentType');
  const grade = document.getElementById('grade');

  if (this.value === 'Student') {
    studentTypeDiv.style.display = 'block';
    studentType.required = true;
  } else {
    studentTypeDiv.style.display = 'none';
    gradeDiv.style.display = 'none';
    studentType.required = false;
    grade.required = false;
  }
});

document.getElementById('studentType').addEventListener('change', function() {
  const gradeDiv = document.getElementById('gradeDiv');
  const grade = document.getElementById('grade');

  if (this.value === 'High School') {
    gradeDiv.style.display = 'block';
    grade.required = true;
  } else {
    gradeDiv.style.display = 'none';
    grade.required = false;
  }
});