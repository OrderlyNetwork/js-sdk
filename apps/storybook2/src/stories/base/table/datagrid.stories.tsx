import type {Meta, StoryObj} from '@storybook/react';
import {fn} from '@storybook/test';
import {Card, DataGrid} from '@orderly.network/ui';

import {OverviewModule} from '@orderly.network/portfolio';
import {OrderlyApp} from "@orderly.network/react-app";


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
        (Story) => (
            <OrderlyApp brokerId={"orderly"} brokerName={""} networkId={"testnet"}><Card><Story/></Card></OrderlyApp>)
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

        return <DataGrid bordered columns={columns} filter={{
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
                {
                    type: 'date',
                    name: 'date'
                },
                {
                    type: 'range',
                    name: 'range'
                }
            ]
        }}/>;
    }
};

export const Filter: Story = {
    render: (args) => {
        const columns = OverviewModule.useAssetHistoryColumns();
        const {dataSource, onSearch} = OverviewModule.useAssetHistoryHook();

        // console.log(dataSource);

        return <DataGrid columns={columns} bordered dataSource={dataSource} filter={{
            onFilter: (filter) => {
                if (filter.name === 'range') {
                    onSearch({
                        startTime: new Date(filter.value.from).getTime().toString(),
                        endTime: new Date(filter.value.to).getTime().toString(),
                    });
                }
            },
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
                // {
                //     type: 'date',
                //     name: 'date'
                // },
                {
                    type: 'range',
                    name: 'range'
                }
            ]
        }}/>;
    }
}
