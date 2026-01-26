// Mock API service to simulate backend interactions

export const api = {
    auth: {
        startBankID: async () => {
            await new Promise((resolve) => setTimeout(resolve, 1500));
            return { success: true, redirectUrl: "https://mock-bankid.com" };
        },
        verifyCallback: async (code: string) => {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            // Simulate successful login
            return {
                success: true,
                user: {
                    name: "Anna Andersson",
                    personalNumber: "19800101-1234",
                    verifiedAt: new Date().toISOString()
                }
            };
        },
        logout: async () => {
            await new Promise((resolve) => setTimeout(resolve, 500));
            return { success: true };
        },
    },
    contracts: {
        list: async () => {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return [
                {
                    id: "1",
                    address: "Storgatan 12, Stockholm",
                    status: "draft" as const,
                    rent: 12000,
                    startDate: "2026-03-01",
                    endDate: "2027-02-28",
                },
                {
                    id: "2",
                    address: "Lilla Vägen 5, Göteborg",
                    status: "signed" as const,
                    rent: 8500,
                    startDate: "2025-01-01",
                    endDate: "2026-01-01",
                },
            ];
        },
        get: async (id: string) => {
            await new Promise((resolve) => setTimeout(resolve, 800));
            return {
                id,
                address: "Storgatan 12, Stockholm",
                rent: 12000,
                deposit: 12000,
                startDate: "2026-03-01",
                endDate: "2027-02-28",
                status: "draft" as const,
                role: "landlord" as const,
                landlord: { name: "Anna Andersson", verified: true },
                tenant: undefined, // Not invited yet
                hasInvitedParty: false,
            };
        },
        create: async (data: any) => {
            await new Promise((resolve) => setTimeout(resolve, 1500));
            return { id: "3", ...data, status: "draft" };
        },
        sign: async (id: string) => {
            // Start signing process
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return { orderRef: "mock-order-ref" };
        },
        checkSignStatus: async (orderRef: string) => {
            // Randomly finish or keep pending
            await new Promise((resolve) => setTimeout(resolve, 1000));
            const isDone = Math.random() > 0.3;
            return { status: isDone ? "complete" : "pending" };
        }
    },
    invites: {
        get: async (token: string) => {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            if (token === "invalid") throw new Error("Ogiltig länk");
            return {
                inviterName: "Erik Eriksson",
                address: "Drottninggatan 1, Stockholm",
                rent: 14000,
                startDate: "2026-04-01",
                endDate: "2027-03-31",
            };
        },
    },
};
