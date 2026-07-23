import type { Meta, StoryObj } from "@storybook/react";
import { Heading, Text } from "../components/layout/Typography";
import React from "react";

const meta = {
  title: "Layout/Typography",
  component: Heading,
  tags: ["autodocs"],
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Headings: Story = {
  render: () => (
    <div className="flex flex-col space-y-4">
      <Heading size="h1">Heading 1</Heading>
      <Heading size="h2">Heading 2</Heading>
      <Heading size="h3">Heading 3</Heading>
      <Heading size="h4">Heading 4</Heading>
    </div>
  ),
};

export const Texts: StoryObj<typeof Text> = {
  render: () => (
    <div className="flex flex-col space-y-4">
      <Text size="lg">Large Text</Text>
      <Text size="default">Default Text</Text>
      <Text size="sm">Small Text</Text>
      <Text size="xs">Extra Small Text</Text>
      <Text variant="muted">Muted Text</Text>
      <Text variant="destructive">Destructive Text</Text>
    </div>
  ),
};
