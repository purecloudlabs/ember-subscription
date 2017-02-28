// the [...arguments] is for Phantom

export function mockEmitter () {
  return new MockEmitter()
}

class MockEmitter {
  constructor () {
    this.history = []
  }

  on () {
    this.history.push({
      method: 'on',
      args: [...arguments]
    })
    return this
  }

  once () {
    this.history.push({
      method: 'once',
      args: [...arguments]
    })
    return this
  }

  removeListener () {
    this.history.push({
      method: 'removeListener',
      args: [...arguments]
    })
    return this
  }
}

export function mockEvented () {
  return new MockEvented()
}

class MockEvented {
  constructor () {
    this.history = []
  }

  on () {
    this.history.push({
      method: 'on',
      args: [...arguments]
    })
    return this
  }

  one () {
    this.history.push({
      method: 'one',
      args: [...arguments]
    })
    return this
  }

  off () {
    this.history.push({
      method: 'off',
      args: [...arguments]
    })
    return this
  }
}
