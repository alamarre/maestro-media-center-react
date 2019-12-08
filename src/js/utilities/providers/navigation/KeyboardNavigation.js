class KeyboardNavigation {
  constructor() {
    this.elements = [];
    document.onkeydown = this.handleKeypress.bind(this);
    document.onkeypress = this.handleKeypress.bind(this);
    document.onkeyup = this.handleBack.bind(this);
    this.current = null;
    this.index = -1;
    this.currentDialog = null;
  }

  handleBack(e) {

    const code = e.which || e.keyCode || 0;
    if (code == 27) {
      e.stopImmediatePropagation();
      e.stopPropagation();
      e.preventDefault();
    }
  }

  handleKeypress(e) {
    const code = e.which || e.keyCode || 0;
    if (code >= 37 && code <= 40) {
      e.preventDefault();
    }
    switch (code) {
    case 37:
      this.moveLeft();
      break;
    case 38:
      this.focusPrevious();
      break;
    case 39:
      this.moveRight();
      break;
    case 40:
      this.focusNext();
      break;
    case 13:
      if (e.type == "keypress") {
        this.select();
      }
      break;
    }
    console.log(code);
  }

  registerElementCollection(collection, navOrder) {
    if (navOrder === 0 || navOrder > 0) {
      this.elements[navOrder] = collection;
    } else {
      this.elements.push(collection);
    }
    if (this.elements.length == 1 || navOrder === 0) {
      this.index = 0;
      collection.focus();
    }
  }

  select() {
    if (this.currentDialog) {
      return this.currentDialog.selectCurrent();
    }
    if (this.index >= 0) {
      const element = this.elements[this.index];
      if (element.selectCurrent) {
        element.selectCurrent();
      } else if (element.click) {
        element.click();
      }
    }
  }

  registerElement(element, navOrder) {
    const wrapper = { element, focus: () => element.focus(), selectCurrent: () => element.focus(), type: "element", };
    if (navOrder === 0 || navOrder > 0) {
      this.elements[navOrder] = wrapper;
    } else {
      this.elements.push(wrapper);
    }
    if (this.elements.length == 1 || navOrder === 0) {
      this.index = 0;
      element.focus();
    }
  }

  remove(element) {
    const index = this.elements.indexOf(element);
    if (index >= 0) {
      this.elements.splice(index, 1);
    }
  }

  focusDialog(dialog) {
    this.currentDialog = dialog;
  }

  unfocusDialog() {
    this.currentDialog = null;
  }

  clear() {
    this.elements = [];
  }

  focusPrevious() {
    if (this.currentDialog) {
      return this.currentDialog.focusPrevious();
    }
    if (this.index > 0) {
      this.index--;
      this.elements[this.index].focus();
    }

  }

  focusNext() {
    if (this.currentDialog) {
      return this.currentDialog.focusNext();
    }
    if (this.index + 1 < this.elements.length) {
      this.index++;
      this.elements[this.index].focus();
    }
  }

  moveLeft() {
    if (this.currentDialog) {
      return this.currentDialog.moveLeft();
    }
    const current = this.elements[this.index];
    if (current.moveLeft) {
      current.moveLeft();
    }
  }

  moveRight() {
    if (this.currentDialog) {
      return this.currentDialog.moveRight();
    }
    const current = this.elements[this.index];
    if (current.moveRight) {
      current.moveRight();
    }
  }



}

module.exports = KeyboardNavigation;
