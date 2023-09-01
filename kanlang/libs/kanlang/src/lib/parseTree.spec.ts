import { Transformation, TransformationTree } from './parseTree';

describe('TransformationTree', () => {
  describe('toJs', () => {
    it('handles variables in root', () =>
      expect(new TransformationTree(null, { name: 'variable' }).toJs()).toEqual(
        ['variable']
      ));
    it('handles function calls without arguments in root', () =>
      expect(
        new TransformationTree(new Transformation([], ['type']), null).toJs()
      ).toEqual(['__type()']));

    it('handles function calls with arguments', () => {
      const tree = new TransformationTree(
        new Transformation(['num'], ['type']),
        null
      );
      tree.children.push(new TransformationTree(null, { name: 'varName' }));
      expect(tree.toJs()).toEqual(['num___type(varName)']);
    });
    it('handles multiple paths', () => {
      const tree = new TransformationTree(null, null);
      tree.children.push(new TransformationTree(null, { name: 'varName' }));
      tree.children.push(new TransformationTree(null, { name: 'otherVar' }));
      expect(tree.toJs()).toEqual(['varName', 'otherVar']);
    });
  });
});
