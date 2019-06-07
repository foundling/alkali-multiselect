// todo: 
// - style guide
// - positioning api
// - express structure in idiomatic alkali declarative form, makes much clearer
// - positioning
// - make 'arbitrarily' nestable and selectable



const { 

  all,
  not,
  reactive,
  subscribe,

  Button,
  Div,
  Element,
  I,
  Input, 
  LI, 
  Span,
  UL, 

  Renderer, 
  Variable,
  VString,
  VArray,

} = alkali

class MultiSelect extends Element { 

  created(props) { 

    const {

      items, 
      selections = null, 
      parentNode = null, 
      open = true, 
      corner = 'topright', 
      closeOnSelect = false,
      placeholder = '',
      maxSelections = null,
      ItemConstructor,
      InputConstructor, 

    } = this.props = props

    // ensure our data is reactive
    props.items = items instanceof Variable ? items : reactive(items || [])
    props.selections = selections instanceof Variable ? selections : reactive(selections || [])

    // set defaults for parameters
    props.closeOnSelect = closeOnSelect
    props.maxSelections = maxSelections || props.items.get('length') // todo: set a min of 1
    props.placeholder = reactive(placeholder)
    props.parentNode = parentNode
    props.corner = corner // 'topleft' | 'topright' | 'bottom left' | 'bottom right'
    props.classList = this.classList

    // selection data
    props.indexedSelections = all(props.selections, props.items).to(([selections, items]) => {
      return items.reduce((memo, item, index) => {
        if (selections.includes(item))
          memo[index] = item
        return memo
      }, {})
    })
    props.lastSelectionIndex = props.items.valueOf().indexOf(props.selections.valueOf().slice(-1)[0])

    // search
    props.searchFilter = new VString('')
    props.hasMatches = all(props.searchFilter, props.items).to(([searchFilter, items]) => {
      if (searchFilter.length === 0) 
        return true 
      return items.filter(item => item.toLowerCase().includes(searchFilter.toLowerCase())).length > 0
    })

    // set default constructors
    props.Item = ItemConstructor || Button('.doc-multiselect-list-item', {
      type: 'button'
    })
    props.Input = (InputConstructor || Div('.doc-multiselect-search-input', {
      onkeyup: (e) => {
        props.searchFilter.put(e.target.value)
      },
      children: [
        Input('.doc-multiselect-search-input-el', {
          placeholder: props.placeholder
        }),
        Span('.fa.fa-search.doc-multiselect-search-input-icon')
      ]
    }))

  }

  ready(props) {

    const tree = this.build(props) 

    this.append(tree)
    this.listContainer = this.querySelector('.doc-multiselect-unselected-container')
    this.closeButton = this.querySelector('.doc-multiselect-close')
    this.selectionsContainer = this.querySelector('.doc-multiselect-selected-container')

  }

  // {} -> HTMLElement
  build(props) {

    return new (Div('.doc-multiselect-container', [
        new Div('.doc-multiselect-close.fa.fa-remove'),
        Div('.doc-multiselect-search-container', [
          props.Input({
            onkeyup: (e) => {
              props.searchFilter.put(e.target.value)
            }  
          })
        ]),
        new Div('.doc-multiselect-selected-container', {
          onclick: this.removeItem.bind(this),
        }, [...props.items.map((item, index) => 
          new Button('.doc-multiselect-list-item.selected', {
            id: `doc-multiselect-selected-list-item-${index}`,
            classes: {
              selected: props.indexedSelections.to(selectedMap => Boolean(selectedMap[index]))
            }
          }, [
            Span('.list-item-text', item, {
              title: 'selected list item',
            }),
            Button('.fa.fa-remove.remove-item', {
              type: 'button',
              title: 'remove list item'
            })
          ])
        )]),
        // why doesn't a .map work here?
        new Div('.doc-multiselect-unselected-container', { 
          onclick: this.selectItem.bind(this)
        },  [...props.items.to(items => items.map((itemText, index) => 
          new props.Item({
            id: `doc-multiselect-unselected-list-item-${index}`,
            title: 'select a list item',
            classes: {
              filtered: props.searchFilter.to(searchFilter => {
                if (searchFilter.length == 0)
                  return false
                return !Boolean(itemText.toLowerCase().includes(searchFilter.toLowerCase()))
              }),
              selected: props.indexedSelections.to(selections => selections[index])
            },
          }, [ 
            Span('.list-item-text', 
            itemText) 
          ])).concat(
              new Div('.doc-multiselect-list-item.no-matches-found', {
                classes: { hidden: this.props.hasMatches }
              }, [ Span('No Results Found!') ])
            )
          )]
        )
      ]
    ))

  }
 
  attached() {
    this.bindEvents()
    this.position(this.props.parentNode || this.parentNode)
  }

  detached() {
    document.body.removeEventListener('click', this.handleOutsideClicks)
  }

  selectItem(e) {

    const props = this.props
    const listItems = [...this.listContainer.children]
    const targetIndex = listItems.indexOf(e.target)
    const parentIndex = listItems.indexOf(e.target.parentNode)
    const index = [targetIndex, parentIndex].filter(i => i >= 0)[0]

    if (index == null)
      return

    const currentValue = props.indexedSelections.get(index)
    const valCount = props.selections.valueOf().length
 
    if (valCount >= props.maxSelections) {

      // at max selections, so we revert prior cached choice 
      // and add this value
 
      if (props.lastSelectionIndex != null) // null when empty values array
        props.indexedSelections.undefine(props.lastSelectionIndex)

      props.indexedSelections.set(index, props.items.get(index))

    } else {

      // we toggle selection
      if (currentValue == null)
        props.indexedSelections.set(index, props.items.get(index))
      else
        props.indexedSelections.undefine(index, undefined)
    }

    const mappedBack = Object.keys(props.indexedSelections.valueOf()).reduce((a,k) => {
        const v = props.indexedSelections.valueOf()[k]  
        return v ? a.concat(v) : a 
    },[])

    props.selections.put(mappedBack)

    if (this.props.closeOnSelect)
      this.props.classList.toggle('hidden')

    e.stopPropagation()
    props.lastSelectionIndex = index

  }

  removeItem(e) {
    const props = this.props
    const listItems = [...this.selectionsContainer.children]

    if (!e.target.classList.contains('remove-item'))
      return

    const index = listItems.indexOf(e.target.parentNode)
    props.indexedSelections.undefine(index)
    const mappedBack = Object.keys(props.indexedSelections.valueOf()).reduce((a,k) => {
        const v = props.indexedSelections.valueOf()[k]  
        return v ? a.concat(v) : a 
    },[])
    props.selections.put(mappedBack)

    if (props.closeOnSelect)
      props.classList.toggle('hidden')
  }

  bindEvents() {
    //this.listContainer.addEventListener('click', this.selectItem.bind(this))
    //this.selectionsContainer.addEventListener('click', this.removeItem.bind(this))
    document.body.addEventListener('click', this.handleOutsideClicks.bind(this))
    //this.closeButton.addEventListener('click', _ => this.props.classList.toggle('hidden'))
  }

  handleOutsideClicks(e) {
    /*
     * if parent node, toggle open
     * if node contains parent node, close if open
     */
    const target = e.target
    const dropdown = this

    // inside click
    if (dropdown.contains(target))
      return

    else if (target === dropdown.parentNode && !this.props.classList.contains('hidden'))
      this.toggleVisibility(e)

    else
      this.props.classList.add('hidden')

  }

  toggleVisibility(e) {
    // fixme: toggling visibility shouldn't care which element it came from 
    // ensure click is between parent node (inclusive) and list (exclusive)
    if (this.parentNode.contains(e.target) && !this.contains(e.target)) {
      this.props.classList.toggle('hidden')
      event.stopPropagation()
    }
  }

  position(node, options = { corner: this.props.corner }) {

    const mountPoint = node.getBoundingClientRect()
    const me = this.getBoundingClientRect()

    //this.style.top = '31px'
    //this.style.left = 0
    return

    // todo: api for positioning a specific corner of multiselect to corner of mount point element
    switch (options.corner) {

      case 'bottomleft':
        this.style.top = `${mountPoint.bottom}px`
        this.style.left = `${mountPoint.left}px` 
        return
      
      case 'bottomright':
        this.style.top = `${mountPoint.bottom}px`
        this.style.left = `${mountPoint.right - this.offsetWidth}px` 
        return
      
      case 'topleft':
        this.style.top = `${mountPoint.bottom}px`
        this.style.left = `${mountPoint.left}px` 
        return
      
      case 'topright':
        this.style.top = `${mountPoint.top}px`
        this.style.left = `${mountPoint.right - this.offsetWidth}px` 
        return
    }

  }
  
}

//export default MultiSelect.defineElement('doc-multiselect')
