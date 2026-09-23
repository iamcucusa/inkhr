// Names the docs may still use until their slice brings them in line: [pattern, slice]. A slice that fixes its
// names removes its rows. The check refuses a pattern that matches a covered token, so no colour name can hide here.
export const PENDING = [
  ['font.*', 'typography'],
  ['--sys-type-*', 'typography'],
  ['space.*', 'spacing'],
  ['--space-*', 'spacing'],
  ['radius.*', 'radius'],
  ['--radius-*', 'radius'],
  ['elevation.*', 'elevation'],
  ['--elevation-*', 'elevation'],
  ['z.*', 'layers'],
  ['motion.*', 'motion'],
];
