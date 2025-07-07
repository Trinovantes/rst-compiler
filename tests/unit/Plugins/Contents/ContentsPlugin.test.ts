import { describe } from 'vitest'
import { testGenerator } from 'tests/fixtures/testGenerator.js'

describe('table of contents includes all sections', () => {
    const input = `
        h1 before
        ----

        .. contents:: Table of Contents

        h1 after
        ----

        h2 after
        ++++

        h3 after
        ****

    `

    const expectedToc = `
        <div id="table-of-contents" class="contents">
            <p class="title">
                Table of Contents
            </p>
            <ul>
                <li>
                    <p>
                        <a href="#h1-before">
                            h1 before
                        </a>
                    </p>
                </li>
                <li>
                    <p>
                        <a href="#h1-after">
                            h1 after
                        </a>
                    </p>
                    <ul>
                        <li>
                            <p>
                                <a href="#h2-after">
                                    h2 after
                                </a>
                            </p>
                            <ul>
                                <li>
                                    <p>
                                        <a href="#h3-after">
                                            h3 after
                                        </a>
                                    </p>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
    `.trim()

    testGenerator(input, `
        <h1 id="h1-before">
            h1 before
        </h1>

        ${expectedToc}

        <h1 id="h1-after">
            h1 after
        </h1>

        <h2 id="h2-after">
            h2 after
        </h2>

        <h3 id="h3-after">
            h3 after
        </h3>
    `, `
        # h1 before {#h1-before}

        ${expectedToc}

        # h1 after {#h1-after}

        ## h2 after {#h2-after}

        ### h3 after {#h3-after}
    `)
})

describe('local table of contents includes all sections of current section (none)', () => {
    const input = `
        h1 before
        ----

        .. contents:: Table of Contents
           :local:

        h1 after
        ----

        h2 after
        ++++

        h3 after
        ****

    `

    const expectedToc = `
        <div id="table-of-contents" class="contents">
            <p class="title">
                Table of Contents
            </p>
        </div>
    `.trim()

    testGenerator(input, `
        <h1 id="h1-before">
            h1 before
        </h1>

        ${expectedToc}

        <h1 id="h1-after">
            h1 after
        </h1>

        <h2 id="h2-after">
            h2 after
        </h2>

        <h3 id="h3-after">
            h3 after
        </h3>
    `, `
        # h1 before {#h1-before}

        ${expectedToc}

        # h1 after {#h1-after}

        ## h2 after {#h2-after}

        ### h3 after {#h3-after}
    `)
})

describe('local table of contents includes all sections of current section (h4)', () => {
    const input = `
        h1 before
        ----

        h2 before
        ++++

        h3 before
        ****

        .. contents:: Table of Contents
           :local:

        h4 after
        ====

        h1 after
        ----

        h2 after
        ++++

        h3 after
        ****

    `

    const expectedToc = `
        <div id="table-of-contents" class="contents">
            <p class="title">
                Table of Contents
            </p>
            <ul>
                <li>
                    <p>
                        <a href="#h4-after">
                            h4 after
                        </a>
                    </p>
                </li>
            </ul>
        </div>
    `.trim()

    testGenerator(input, `
        <h1 id="h1-before">
            h1 before
        </h1>

        <h2 id="h2-before">
            h2 before
        </h2>

        <h3 id="h3-before">
            h3 before
        </h3>

        ${expectedToc}

        <h4 id="h4-after">
            h4 after
        </h4>

        <h1 id="h1-after">
            h1 after
        </h1>

        <h2 id="h2-after">
            h2 after
        </h2>

        <h3 id="h3-after">
            h3 after
        </h3>
    `, `
        # h1 before {#h1-before}

        ## h2 before {#h2-before}

        ### h3 before {#h3-before}

        ${expectedToc}

        #### h4 after {#h4-after}

        # h1 after {#h1-after}

        ## h2 after {#h2-after}

        ### h3 after {#h3-after}
    `)
})

describe('table of contents depth excludes sections with higher levels', () => {
    const input = `
        h1 before
        ----

        .. contents:: Table of Contents
           :depth: 2

        h1 after
        ----

        h2 after
        ++++

        h3 after
        ****

    `

    const expectedToc = `
        <div id="table-of-contents" class="contents">
            <p class="title">
                Table of Contents
            </p>
            <ul>
                <li>
                    <p>
                        <a href="#h1-before">
                            h1 before
                        </a>
                    </p>
                </li>
                <li>
                    <p>
                        <a href="#h1-after">
                            h1 after
                        </a>
                    </p>
                    <ul>
                        <li>
                            <p>
                                <a href="#h2-after">
                                    h2 after
                                </a>
                            </p>
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
    `.trim()

    testGenerator(input, `
        <h1 id="h1-before">
            h1 before
        </h1>

        ${expectedToc}

        <h1 id="h1-after">
            h1 after
        </h1>

        <h2 id="h2-after">
            h2 after
        </h2>

        <h3 id="h3-after">
            h3 after
        </h3>
    `, `
        # h1 before {#h1-before}

        ${expectedToc}

        # h1 after {#h1-after}

        ## h2 after {#h2-after}

        ### h3 after {#h3-after}
    `)
})
