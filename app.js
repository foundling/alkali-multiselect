const books = [
  'JavaScript: The Good Parts',
  'JavaScript: The Definitive Guide',
  'Effective JavaScript',
  'The Architecture of Open Source Applications, Vol. II',
  'Unix Network Programming',
  'Programming Languages',
  'The Design of the Unix Operating System',
  'The Art of SQL',
]

MultiSelect.defineElement('doc-multiselect')

const ms1 = new MultiSelect({ items: books })
document.querySelector('.no-parent').appendChild(ms1)

new MultiSelect({ parentNode: document.querySelector('.with-parent > .multiselect-parent') })
