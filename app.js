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

const example1 = document.querySelector('.no-parent')
const btn = example1.querySelector('button')
const hidden = reactive(false)

document.addEventListener('doc-multiselect-selected', ({ detail }) => {
  console.log(detail.item + ' selected')
})

document.addEventListener('doc-multiselect-removed', ({ detail }) => {
  console.log(detail.item + ' removed')
})

document.addEventListener('doc-multiselect-closed',() => {
  hidden.put(true)
})
btn.addEventListener('click',() => {
  hidden.put(!hidden.valueOf())
})
const ms1 = new MultiSelect({ 
  items: books,
  selections: books.filter(book => book.toLowerCase().includes('javascript')), 
  mountPoint: {
    parentNode: btn,
    corner: 'bottomleft'
  },
  classes: {
    hidden
  }
})

example1.appendChild(ms1)
