import type {Meta, StoryObj} from '@storybook/react';
import {fn} from '@storybook/test';
import {Card, DataGrid} from '@orderly.network/ui';

import {OverviewModule} from '@orderly.network/portfolio';


// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
    title: 'Base/Table/DataGrid',
    component: DataGrid,
    parameters: {
        // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
        // layout: 'centered',
    },
    // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
    // tags: ['autodocs'],
    // More on argTypes: https://storybook.js.org/docs/api/argtypes
    decorators: [
        (Story) => (<Card><Story/></Card>)
    ],
    argTypes: {
        // backgroundColor: { control: 'color' },
    },
    // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
    args: {},
} satisfies Meta<typeof DataGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default: Story = {
    render: (args) => {
        const columns = OverviewModule.useAssetHistoryColumns();

        return <DataGrid columns={columns} filter={{
            onFilter: fn(),
            items: [

                {
                    type: 'select',
                    name: 'state',
                    value: 'all',
                    defaultValue: 'all',
                    options: [
                        {label: 'All', value: 'all'},
                        {label: 'Active', value: 'active'},
                        {label: 'Inactive', value: 'inactive'},
                    ]
                },
                'date',
            ]
        }}/>;
    }
    // args: {
    //   // columns: [
    //   //   { title: 'Symbol', dataIndex: 'symbol' },
    //   // ],
    //   // dataSource: [
    //   //   {
    //   //     symbol: 'ETH',
    //   //   }
    //   // ]
    // },
};
