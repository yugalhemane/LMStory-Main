import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "../components/forms/Input";

const meta = {
  title: "Forms/Input",
  component: Input,
  tags: ["autodocs"],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Email address",
    type: "email",
  },
};

export const Disabled: Story = {
  args: {
    placeholder: "Email address",
    disabled: true,
  },
};
