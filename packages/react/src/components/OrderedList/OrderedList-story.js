import React from 'react';
import OrderedList from '../OrderedList';
import ListItem from '../ListItem';

export default {
  title: 'OrderedList',

  parameters: {
    component: OrderedList,

    subcomponents: {
      ListItem,
    },
  },
};

export const Default = () => (
  <OrderedList>
    <ListItem>Ordered List level 1</ListItem>
    <ListItem>Ordered List level 1</ListItem>
    <ListItem>Ordered List level 1</ListItem>
  </OrderedList>
);

Default.storyName = 'default';

Default.parameters = {
  info: {
    text: `Lists consist of related content grouped together and organized vertically. Ordered lists are used to present content in a numbered list.`,
  },
};

export const Nested = () => (
  <OrderedList>
    <ListItem>
      Ordered List level 1
      <OrderedList nested>
        <ListItem>Ordered List level 2</ListItem>
        <ListItem>
          Ordered List level 2
          <OrderedList nested>
            <ListItem>Ordered List level 2</ListItem>
            <ListItem>Ordered List level 2</ListItem>
          </OrderedList>
        </ListItem>
      </OrderedList>
    </ListItem>
    <ListItem>Ordered List level 1</ListItem>
    <ListItem>Ordered List level 1</ListItem>
  </OrderedList>
);

Nested.storyName = 'nested';

Nested.parameters = {
  info: {
    text: `Lists consist of related content grouped together and organized vertically. Ordered lists are used to present content in a numbered list.`,
  },
};
