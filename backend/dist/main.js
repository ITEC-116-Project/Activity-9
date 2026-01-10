"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const path_1 = require("path");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
    }));
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'uploads'), {
        prefix: '/uploads/',
    });
    app.enableCors({
        origin: ['http://localhost:3000', 'http://localhost:5173'],
    });
    await app.listen(process.env.PORT || 3000);
    console.log(`🚀 Server running on http://localhost:${process.env.PORT || 3000}`);
}
bootstrap();
//# sourceMappingURL=main.js.map