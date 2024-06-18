import { testGenerator } from 'tests/fixtures/testGenerator.js'
import { describe } from 'vitest'

describe('list-table directive', () => {
    const input = `
        .. list-table:: Frozen Delights!
            :widths: 15 10 30
            :header-rows: 1

            * - Treat
              - Quantity
              - Description
            * - Albatross
              - 2.99
              - On a stick!
            * - Crunchy Frog
              - 1.49
              - If we took the bones out, it wouldn't be
                crunchy, now would it?
            * - Gannet Ripple
              - 1.99
              - On a stick!
    `

    testGenerator(input, `
        <table>
            <caption>
                <p>
                    Frozen Delights!
                </p>
            </caption>
            <thead>
                <tr>
                    <th style="width:15%;">
                        <p>
                            Treat
                        </p>
                    </th>
                    <th style="width:10%;">
                        <p>
                            Quantity
                        </p>
                    </th>
                    <th style="width:30%;">
                        <p>
                            Description
                        </p>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="width:15%;">
                        <p>
                            Albatross
                        </p>
                    </td>
                    <td style="width:10%;">
                        <p>
                            2.99
                        </p>
                    </td>
                    <td style="width:30%;">
                        <p>
                            On a stick!
                        </p>
                    </td>
                </tr>
                <tr>
                    <td style="width:15%;">
                        <p>
                            Crunchy Frog
                        </p>
                    </td>
                    <td style="width:10%;">
                        <p>
                            1.49
                        </p>
                    </td>
                    <td style="width:30%;">
                        <p>
                            If we took the bones out, it wouldn&apos;t be
                            crunchy, now would it?
                        </p>
                    </td>
                </tr>
                <tr>
                    <td style="width:15%;">
                        <p>
                            Gannet Ripple
                        </p>
                    </td>
                    <td style="width:10%;">
                        <p>
                            1.99
                        </p>
                    </td>
                    <td style="width:30%;">
                        <p>
                            On a stick!
                        </p>
                    </td>
                </tr>
            </tbody>
        </table>
    `)
})
