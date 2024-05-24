import type { Meta, StoryObj } from '@storybook/react';
// import { fn } from '@storybook/test';
import {Axis, Bar, Chart,Legend,Line, PnLChart} from '@orderly.network/chart';
import { Box } from '@orderly.network/ui';

const meta = {
    title: 'Chart/Chart',
    component: Chart,
    parameters: {
      // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
      layout: 'centered',
    },
    // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
    // tags: ['autodocs'],
    // More on argTypes: https://storybook.js.org/docs/api/argtypes
    argTypes: {
    //   backgroundColor: { control: 'color' },
 
    },
    decorators: [
      (Story) => (
        <Box width="500px" height={'400px'}>
          {/* 👇 Decorators in Storybook also accept a function. Replace <Story/> with Story() to enable it  */}
          <Story />
        </Box>
      ),
    ],
    // // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
    args: {
      
      data:[{
        "date": "2007-04-23T00:00:00.000Z",
        "close": 93.24
      },
      {
        "date": "2007-04-24T00:00:00.000Z",
        "close": -55.35
      },
      {
        "date": "2007-04-25T00:00:00.000Z",
        "close": 98.84
      },
      {
        "date": "2007-04-26T00:00:00.000Z",
        "close": 99.92
      },
      {
        "date": "2007-04-29T00:00:00.000Z",
        "close": 99.8
      },
      {
        "date": "2007-05-01T00:00:00.000Z",
        "close": 99.47
      },
      {
        "date": "2007-05-02T00:00:00.000Z",
        "close": 100.39
      },
      {
        "date": "2007-05-03T00:00:00.000Z",
        "close": 70.4
      },
      {
        "date": "2007-05-04T00:00:00.000Z",
        "close": 100.81
      },
      {
        "date": "2007-05-07T00:00:00.000Z",
        "close": -32.98
      },
      {
        "date": "2007-05-08T00:00:00.000Z",
        "close": -56.06
      },
      {
        "date": "2007-05-09T00:00:00.000Z",
        "close": 106.88
      },
      {
        "date": "2007-05-09T00:00:00.000Z",
        "close": 107.34
      },
      {
        "date": "2007-05-10T00:00:00.000Z",
        "close": 108.74
      },
      {
        "date": "2007-05-13T00:00:00.000Z",
        "close": 109.36
      },
      {
        "date": "2007-05-14T00:00:00.000Z",
        "close": 107.52
      },
      {
        "date": "2007-05-15T00:00:00.000Z",
        "close": 107.34
      },
      {
        "date": "2007-05-16T00:00:00.000Z",
        "close": 109.44
      },],
x:'date',
y:'close'
     },
  } satisfies Meta<typeof Chart>;

  export default meta;
  type Story = StoryObj<typeof meta>;

  export const Default: Story = {

  };

  export const LineChart: Story = {
    args:{
      children:(<>
      {/* <Axis/> */}
      <Axis orientation='left'/>
      <Line/>
      </>),
      data:[{
        "date": "2007-04-23T00:00:00.000Z",
        "close": 93.24
      },
      {
        "date": "2007-04-24T00:00:00.000Z",
        "close": 55.35
      },
      {
        "date": "2007-04-25T00:00:00.000Z",
        "close": 98.84
      },
      {
        "date": "2007-04-26T00:00:00.000Z",
        "close": 99.92
      },
      {
        "date": "2007-04-29T00:00:00.000Z",
        "close": 99.8
      },
      {
        "date": "2007-05-01T00:00:00.000Z",
        "close": 99.47
      },
      {
        "date": "2007-05-02T00:00:00.000Z",
        "close": 100.39
      },
      {
        "date": "2007-05-03T00:00:00.000Z",
        "close": 70.4
      },
      {
        "date": "2007-05-04T00:00:00.000Z",
        "close": 100.81
      },
      {
        "date": "2007-05-07T00:00:00.000Z",
        "close": 32.98
      },
      {
        "date": "2007-05-08T00:00:00.000Z",
        "close": 56.06
      },
      {
        "date": "2007-05-09T00:00:00.000Z",
        "close": 106.88
      },
      {
        "date": "2007-05-09T00:00:00.000Z",
        "close": 107.34
      },
      {
        "date": "2007-05-10T00:00:00.000Z",
        "close": 108.74
      },
      {
        "date": "2007-05-13T00:00:00.000Z",
        "close": 109.36
      },
      {
        "date": "2007-05-14T00:00:00.000Z",
        "close": 107.52
      },
      {
        "date": "2007-05-15T00:00:00.000Z",
        "close": 107.34
      },
      {
        "date": "2007-05-16T00:00:00.000Z",
        "close": 109.44
      },]
    }
  }

  export const BarChart: Story = {
    args:{
      children:(<><Axis orientation='left'/><Bar/><Legend/></>)
    }
  }

  export const DailypnlChart: Story = {
    args:{
      children:(<><Axis orientation='left'/><PnLChart colors={{
        profit:'green',
        loss:'red'
      }}/></>)
    }
  }