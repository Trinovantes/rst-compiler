// ----------------------------------------------------------------------------
// MARK: Helpers
// ----------------------------------------------------------------------------

/**
 * @param {string} groupKey
 * @returns string | null
 */
const loadStorage = (groupKey) => {
    try {
        return window.localStorage.getItem(`LOCAL_STORAGE_KEY:${groupKey}`)
    } catch (err) {
        console.warn(err)
        return null
    }
}

/**
 * @param {string} groupKey
 * @param {string} value
 * @returns string | null
 */
const saveStorage = (groupKey, value) => {
    try {
        window.localStorage.setItem(`LOCAL_STORAGE_KEY:${groupKey}`, value)
        return value
    } catch (err) {
        console.warn(err)
        return null
    }
}

// ----------------------------------------------------------------------------
// MARK: Container
// ----------------------------------------------------------------------------

const template = document.createElement('template')
template.innerHTML = `
    <style>
        :host {
            display: flex;
            flex-wrap: wrap;
        }
        ::slotted(ELEMENT_HEADING) {
            cursor: pointer;
        }
        ::slotted(ELEMENT_HEADING[selected]) {
            font-weight: bold;
        }
        ::slotted(ELEMENT_PANEL) {
            flex-basis: 100%;
        }
    </style>

    <slot name="TEMPLATE_SLOT_NAME_HEADING"></slot>
    <slot name="TEMPLATE_SLOT_NAME_PANEL"></slot>
`

class TabContainer extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
        this.shadowRoot.appendChild(template.content.cloneNode(true))

        const headingSlot = this.shadowRoot.querySelector('slot[name="TEMPLATE_SLOT_NAME_HEADING"]')
        headingSlot.addEventListener('slotchange', () => {
            this.#linkPanels()
        })

        const panelSlot = this.shadowRoot.querySelector('slot[name="TEMPLATE_SLOT_NAME_PANEL"]')
        panelSlot.addEventListener('slotchange', () => {
            this.#linkPanels()
        })
    }

    connectedCallback() {
        this.setAttribute('role', 'tablist')
    }

    get #headings() {
        return Array.from(this.querySelectorAll(':scope > ELEMENT_HEADING'))
    }

    get #panels() {
        return Array.from(this.querySelectorAll(':scope > ELEMENT_PANEL'))
    }

    #linkPanels() {
        for (const heading of this.#headings) {
            const panel = heading.nextElementSibling
            if (!panel) {
                continue
            }

            heading.setAttribute('aria-controls', panel.id)
            panel.setAttribute('aria-labelledby', heading.id)
        }

        // Since this function is called by the 'slotchange' event, this function runs before the child is finished attaching to the DOM
        // Thus we need to wait for next tick in the event loop to before we can access it via 'this.#headings'
        setTimeout(() => {
            const groupKey = this.getAttribute('ATTR_TAB_GROUP_NAME')
            const lastSelected = loadStorage(groupKey)

            const selectedTab = groupKey
                ? this.#headings.find((heading) => heading.getAttribute('ATTR_HEADING_NAME') === lastSelected)
                : this.#headings.find((heading) => heading.selected)

            const newTab = selectedTab ?? this.#headings[0]
            this.selectTab(newTab)
        }, 0)
    }

    #resetTabs() {
        for (const heading of this.#headings) {
            heading.selected = false
        }
        for (const panel of this.#panels) {
            panel.hidden = true
        }
    }

    /**
     * @param {TabHeading} newHeading
     * @returns void
     */
    selectTab(newHeading) {
        this.#resetTabs()

        const newPanelId = newHeading.getAttribute('aria-controls')
        if (!newPanelId) {
            return
        }

        const newPanel = this.querySelector(`#${newPanelId}`)
        if (!newPanel) {
            return
        }

        newHeading.selected = true
        newPanel.hidden = false
    }

    /**
     * @param {string} selectedHeadingName
     * @returns void
     */
    selectTabForEveryoneElse(selectedHeadingName) {
        const groupKey = this.getAttribute('ATTR_TAB_GROUP_NAME')
        const allTabContainers = document.querySelectorAll(`ELEMENT_CONTAINER[ATTR_TAB_GROUP_NAME="${groupKey}"]`)

        for (const otherContainer of allTabContainers) {
            if (otherContainer === this) {
                continue
            }
            if (!(otherContainer instanceof TabContainer)) {
                continue
            }

            const otherContainerHeading = otherContainer.querySelector(`ELEMENT_HEADING[ATTR_HEADING_NAME=${selectedHeadingName}]`)
            otherContainer.selectTab(otherContainerHeading)
        }

        saveStorage(groupKey, selectedHeadingName)
    }
}

customElements.define('ELEMENT_CONTAINER', TabContainer)

// ----------------------------------------------------------------------------
// MARK: Panel
// ----------------------------------------------------------------------------

class TabPanel extends HTMLElement {
    static counter = 1

    connectedCallback() {
        if (!this.id) {
            this.id = `ELEMENT_PANEL-${TabPanel.counter++}`
        }

        this.setAttribute('role', 'tabpanel')
    }
}

customElements.define('ELEMENT_PANEL', TabPanel)

// ----------------------------------------------------------------------------
// MARK: Heading
// ----------------------------------------------------------------------------

class TabHeading extends HTMLElement {
    static counter = 1

    connectedCallback() {
        if (!this.id) {
            this.id = `ELEMENT_HEADING-${TabHeading.counter++}`
        }

        this.setAttribute('role', 'tab')
        this.setAttribute('aria-selected', 'false')
        this.setAttribute('tabindex', -1)

        this.addEventListener('click', () => {
            const container = this.parentNode
            if (!(container instanceof TabContainer)) {
                throw new Error('parentNode is not TabContainer')
            }

            container.selectTab(this)
            container.selectTabForEveryoneElse(this.getAttribute('ATTR_HEADING_NAME'))
        })
    }

    get selected() {
        return this.hasAttribute('selected')
    }

    set selected(value) {
        if (value) {
            this.setAttribute('selected', '')
        } else {
            this.removeAttribute('selected')
        }
    }

    static get observedAttributes() {
        return ['selected']
    }

    attributeChangedCallback() {
        const selected = this.hasAttribute('selected')
        this.setAttribute('aria-selected', selected)
        this.setAttribute('tabindex', selected ? 0 : -1)
    }
}

customElements.define('ELEMENT_HEADING', TabHeading)
