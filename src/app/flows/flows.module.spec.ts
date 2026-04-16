import { FlowsModule } from './flows.module';

describe('FlowsModule', () => {
  let flowsModule: FlowsModule;

  beforeEach(() => {
    flowsModule = new FlowsModule();
  });

  it('should create an instance', () => {
    expect(flowsModule).toBeTruthy();
  });
});
