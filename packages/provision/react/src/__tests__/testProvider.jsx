import React from 'react';
import { shallow } from 'enzyme';
import createProvider from '../createProvider';

const CLASS_NAME = 'CLASS_NAME';
const PROVISION = 'PROVISION_EXAMPLE';

const Presenter = () => (
  <div className={CLASS_NAME} />
);

let mapPropsToRequirements;
let requireProvision;
let resolveProvision;
let provide;
beforeEach(() => {
  mapPropsToRequirements = jest.fn(({ requirements }) => requirements);
  requireProvision = jest.fn(() => Promise.resolve());
  resolveProvision = jest.fn(() => PROVISION);
  provide = createProvider({
    requireProvision,
    resolveProvision,
  });
});

describe('Provider', () => {
  it('should render wrapped component', () => {
    const WrappedComponent = provide(mapPropsToRequirements)(Presenter);
    expect((
      shallow((
        <WrappedComponent />
      )).dive().hasClass(CLASS_NAME)
    )).toBe(true);
  });

  it('should require provision on first mount', () => {
    const WrappedComponent = provide(mapPropsToRequirements)(Presenter);
    const requirements = 'requirements';
    const props = { requirements };
    shallow((
      <WrappedComponent {...props} />
    )).dive();
    expect(requireProvision.mock.calls).toEqual([[requirements, props]]);
  });

  it('should require provision on update if requirements is changed', () => {
    const WrappedComponent = provide(mapPropsToRequirements)(Presenter);
    const propsA = { requirements: 'requirementsA' };
    const propsB = { requirements: 'requirementsB' };
    const instance = shallow((
      <WrappedComponent {...propsA} />
    ));
    instance.setProps(propsB);
    expect(requireProvision.mock.calls).toEqual([
      [propsA.requirements, propsA],
      [propsB.requirements, propsB],
    ]);
  });

  it('should not require provision on update if requirements is equal', () => {
    const WrappedComponent = provide(mapPropsToRequirements)(Presenter);
    const props = { requirements: 'requirements' };
    const instance = shallow((
      <WrappedComponent {...props} />
    ));
    instance.setProps({ requirements: props.requirements, whateverToEnsureUpdate: true });
    expect(requireProvision.mock.calls).toEqual([[props.requirements, props]]);
  });

  it('should pass provision prop to wrapped component, gained from resolveProvision func', () => {
    const WrappedComponent = provide(mapPropsToRequirements)(Presenter);
    const props = shallow((
      <WrappedComponent requirements="does not matter" />
    )).props();
    expect(props).toEqual(expect.objectContaining({ provision: PROVISION }));
  });
});
