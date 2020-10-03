import { EscapehtmlPipe } from '../pipes/escapehtml.pipe';

describe('EscapehtmlPipe', () => {
  it('create an instance', () => {
    const pipe = new EscapehtmlPipe(null);
    expect(pipe).toBeTruthy();
  });
});
