import { Editor } from '@tiptap/core'
import { Document } from '@tiptap/extension-document'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import ExtensionReactComponent from './extension'

// Mock the demo component since we're only testing the extension
jest.mock('./demo-cmp', () => {
  return {
    __esModule: true,
    default: () => null
  }
})

describe('ExtensionReactComponent', () => {
  let editor: Editor

  beforeEach(() => {
    editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        ExtensionReactComponent,
      ],
    })
  })

  afterEach(() => {
    editor.destroy()
  })

  it('should be properly configured with correct name', () => {
    expect(ExtensionReactComponent.name).toBe('reactComponent')
  })

  it('should have the correct group', () => {
    // Access the configuration directly
    const config: any = ExtensionReactComponent
    expect(config.config.group).toBe('block')
  })

  it('should be an atom node', () => {
    const config: any = ExtensionReactComponent
    expect(config.config.atom).toBe(true)
  })

  it('should have default count attribute of 0', () => {
    const config: any = ExtensionReactComponent
    const addAttributes = config.config.addAttributes
    if (typeof addAttributes === 'function') {
      const attributes: any = addAttributes()
      expect(attributes.count).toBeDefined()
      expect(attributes.count.default).toBe(0)
    }
  })

  it('should parse HTML tag react-component', () => {
    const config: any = ExtensionReactComponent
    const parseHTML = config.config.parseHTML
    if (typeof parseHTML === 'function') {
      const rules: any = parseHTML()
      expect(rules).toHaveLength(1)
      expect(rules[0].tag).toBe('react-component')
    }
  })

  it('should render HTML correctly', () => {
    const config: any = ExtensionReactComponent
    const renderHTML = config.config.renderHTML
    if (typeof renderHTML === 'function') {
      const HTMLAttributes = { 'data-count': 5 }
      const result: any = renderHTML({ HTMLAttributes })
      expect(result).toHaveLength(2)
      expect(result[0]).toBe('react-component')
      expect(result[1]).toEqual(HTMLAttributes)
    }
  })

  it('should render content correctly in editor', () => {
    // Attempt to insert the react component
    const success = editor.commands.insertContent('<react-component></react-component>')
    expect(success).toBeTruthy()

    // Check if the content includes our component
    const html = editor.getHTML()
    expect(html).toContain('react-component')
  })

  it('should handle default attributes properly', () => {
    const config: any = ExtensionReactComponent
    const addAttributes = config.config.addAttributes
    if (typeof addAttributes === 'function') {
      const attributes: any = addAttributes()
      expect(attributes.count.default).toBe(0)
    }
  })

  it('should create a node view', () => {
    const config: any = ExtensionReactComponent
    const addNodeView = config.config.addNodeView
    if (typeof addNodeView === 'function') {
      const nodeView: any = addNodeView()
      expect(nodeView).toBeDefined()
    }
  })
})