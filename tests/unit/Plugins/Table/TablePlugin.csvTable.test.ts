import { testGenerator } from 'tests/fixtures/testGenerator.js'
import { describe } from 'vitest'

describe('csv-table directive', () => {
    const input = `
        .. csv-table:: Frozen Delights!
           :header: "Treat", "Quantity", "Description"
           :widths: 15, 10, 30

           "*Albatross*", 2.99, "On a stick!"
           "Crunchy Frog", 1.49, "If we took the bones out,
           it wouldn't be crunchy, now would it?"
           "Gannet Ripple", 1.99, "On a stick!"
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
                        Treat
                    </th>
                    <th style="width:10%;">
                        Quantity
                    </th>
                    <th style="width:30%;">
                        Description
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="width:15%;">
                        Albatross
                    </td>
                    <td style="width:10%;">
                        2.99
                    </td>
                    <td style="width:30%;">
                        On a stick!
                    </td>
                </tr>
                <tr>
                    <td style="width:15%;">
                        Crunchy Frog
                    </td>
                    <td style="width:10%;">
                        1.49
                    </td>
                    <td style="width:30%;">
                        If we took the bones out,
                        it wouldn't be crunchy, now would it?
                    </td>
                </tr>
                <tr>
                    <td style="width:15%;">
                        Gannet Ripple
                    </td>
                    <td style="width:10%;">
                        1.99
                    </td>
                    <td style="width:30%;">
                        On a stick!
                    </td>
                </tr>
            </tbody>
        </table>
    `)
})
