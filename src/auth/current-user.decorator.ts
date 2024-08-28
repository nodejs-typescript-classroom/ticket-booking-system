import { createParamDecorator, ExecutionContext } from "@nestjs/common";

// decode the request to user
const getCurrentUserByContext = (context: ExecutionContext) => 
  context.switchToHttp().getRequest().user;

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => 
    getCurrentUserByContext(context),
)