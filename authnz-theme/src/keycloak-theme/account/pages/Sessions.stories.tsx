import type { Meta, StoryObj } from "@storybook/react";
import { createKcPageStory } from "../KcPageStory";

const { KcPageStory } = createKcPageStory({ pageId: "sessions.ftl" });

const meta = {
    title: "account/sessions.ftl",
    component: KcPageStory
} satisfies Meta<typeof KcPageStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                sessions: {
                    sessions: [
                        {
                            expires: "2024-04-26T18:14:19Z",
                            clients: ["account"],
                            ipAddress: "172.20.0.1",
                            started: "2024-04-26T08:14:19Z",
                            lastAccess: "2024-04-26T08:30:54Z",
                            id: "af835e30-4821-43b1-b4f7-e732d3cc15d2"
                        },
                        {
                            expires: "2024-04-26T18:14:09Z",
                            clients: ["security-admin-console", "account"],
                            ipAddress: "172.20.0.1",
                            started: "2024-04-26T08:14:09Z",
                            lastAccess: "2024-04-26T08:15:14Z",
                            id: "60a9d8b8-617d-441e-8643-08c3fe30e231"
                        }
                    ]
                },
                stateChecker: "xQ7EOgFrLi4EvnJ8dbXKhwFGWk_bkOp0X89mhilt1os"
            }}
        />
    )
};

export const WithError: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                url: { passwordUrl: "/auth/realms/keycloakify/account/password" },
                stateChecker: "xQ7EOgFrLi4EvnJ8dbXKhwFGWk_bkOp0X89mhilt1os",
                message: {
                    summary: "Invalid existing password.",
                    type: "error"
                }
            }}
        />
    )
};
