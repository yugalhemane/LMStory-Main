"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanDatabase = void 0;
const globals_1 = require("@jest/globals");
const prisma_1 = require("../src/database/prisma");
(0, globals_1.beforeAll)(async () => {
    // Global Setup before E2E tests
});
(0, globals_1.afterAll)(async () => {
    await prisma_1.prisma.$disconnect();
});
// Utility to clean DB before each test suite
const cleanDatabase = async () => {
    // Order matters due to foreign keys!
    await prisma_1.prisma.refreshToken.deleteMany();
    await prisma_1.prisma.verificationChallenge.deleteMany();
    await prisma_1.prisma.subscriptionAccount.deleteMany();
    await prisma_1.prisma.invitation.deleteMany();
    await prisma_1.prisma.license.deleteMany();
    await prisma_1.prisma.installation.deleteMany();
    // Clean Users and Tenants safely
    await prisma_1.prisma.user.deleteMany();
    await prisma_1.prisma.tenant.deleteMany();
    // Make sure we have a Trial subscription plan for tenant provisioning
    const existingPlan = await prisma_1.prisma.subscriptionPlan.findFirst({ where: { isActive: true } });
    if (!existingPlan) {
        await prisma_1.prisma.subscriptionPlan.create({
            data: {
                name: 'Trial Plan',
                code: 'TRIAL-14D',
                isActive: true,
            }
        });
    }
};
exports.cleanDatabase = cleanDatabase;
//# sourceMappingURL=setup.e2e.js.map