import { describe } from 'vitest'
import { testGenerator } from 'tests/fixtures/testGenerator.js'

describe(':align: config generates style:text-align on <td>', () => {
    const input = `
        .. table:: Truth table for "not"
            :align: left

            =====  =====
            A      not A
            =====  =====
            False  True
            True   False
            =====  =====
    `

    testGenerator(input, `
        <table>
            <caption>
                <p>
                    Truth table for &quot;not&quot;
                </p>
            </caption>
            <thead>
                <tr>
                    <th style="text-align:left;">
                        <p>
                            A
                        </p>
                    </th>
                    <th style="text-align:left;">
                        <p>
                            not A
                        </p>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="text-align:left;">
                        <p>
                            False
                        </p>
                    </td>
                    <td style="text-align:left;">
                        <p>
                            True
                        </p>
                    </td>
                </tr>
                <tr>
                    <td style="text-align:left;">
                        <p>
                            True
                        </p>
                    </td>
                    <td style="text-align:left;">
                        <p>
                            False
                        </p>
                    </td>
                </tr>
            </tbody>
        </table>
    `)
})

describe(':width: config generates style:width on <table>', () => {
    const input = `
        .. table:: Truth table for "not"
            :width: auto

            =====  =====
            A      not A
            =====  =====
            False  True
            True   False
            =====  =====
    `

    testGenerator(input, `
        <table style="width:auto;">
            <caption>
                <p>
                    Truth table for &quot;not&quot;
                </p>
            </caption>
            <thead>
                <tr>
                    <th>
                        <p>
                            A
                        </p>
                    </th>
                    <th>
                        <p>
                            not A
                        </p>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <p>
                            False
                        </p>
                    </td>
                    <td>
                        <p>
                            True
                        </p>
                    </td>
                </tr>
                <tr>
                    <td>
                        <p>
                            True
                        </p>
                    </td>
                    <td>
                        <p>
                            False
                        </p>
                    </td>
                </tr>
            </tbody>
        </table>
    `)
})

describe(':widths:(auto) config does not generate any attributes on <td>', () => {
    const input = `
        .. table:: Truth table for "not"
            :widths: auto

            =====  =====
            A      not A
            =====  =====
            False  True
            True   False
            =====  =====
    `

    testGenerator(input, `
        <table>
            <caption>
                <p>
                    Truth table for &quot;not&quot;
                </p>
            </caption>
            <thead>
                <tr>
                    <th>
                        <p>
                            A
                        </p>
                    </th>
                    <th>
                        <p>
                            not A
                        </p>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <p>
                            False
                        </p>
                    </td>
                    <td>
                        <p>
                            True
                        </p>
                    </td>
                </tr>
                <tr>
                    <td>
                        <p>
                            True
                        </p>
                    </td>
                    <td>
                        <p>
                            False
                        </p>
                    </td>
                </tr>
            </tbody>
        </table>
    `)
})

describe(':widths:(grid) config generates style:width attribute on <td> based on character lengths', () => {
    const input = `
        .. table:: Truth table for "not"
            :widths: grid

            =====  =====
            A      not A
            =====  =====
            False  True
            True   False
            =====  =====
    `

    testGenerator(input, `
        <table>
            <caption>
                <p>
                    Truth table for &quot;not&quot;
                </p>
            </caption>
            <thead>
                <tr>
                    <th style="width:50%;">
                        <p>
                            A
                        </p>
                    </th>
                    <th style="width:50%;">
                        <p>
                            not A
                        </p>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="width:50%;">
                        <p>
                            False
                        </p>
                    </td>
                    <td style="width:50%;">
                        <p>
                            True
                        </p>
                    </td>
                </tr>
                <tr>
                    <td style="width:50%;">
                        <p>
                            True
                        </p>
                    </td>
                    <td style="width:50%;">
                        <p>
                            False
                        </p>
                    </td>
                </tr>
            </tbody>
        </table>
    `)
})

describe(':widths:(Array<string>) config generates style:width attribute on <td> based on user values', () => {
    const input = `
        .. table:: Truth table for "not"
            :widths: 25 auto

            =====  =====
            A      not A
            =====  =====
            False  True
            True   False
            =====  =====
    `

    testGenerator(input, `
        <table>
            <caption>
                <p>
                    Truth table for &quot;not&quot;
                </p>
            </caption>
            <thead>
                <tr>
                    <th style="width:25%;">
                        <p>
                            A
                        </p>
                    </th>
                    <th style="width:auto;">
                        <p>
                            not A
                        </p>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="width:25%;">
                        <p>
                            False
                        </p>
                    </td>
                    <td style="width:auto;">
                        <p>
                            True
                        </p>
                    </td>
                </tr>
                <tr>
                    <td style="width:25%;">
                        <p>
                            True
                        </p>
                    </td>
                    <td style="width:auto;">
                        <p>
                            False
                        </p>
                    </td>
                </tr>
            </tbody>
        </table>
    `)
})
