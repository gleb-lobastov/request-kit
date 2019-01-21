import React from 'react';
import { shallow } from 'enzyme';
import createProvider from '../createProvider.tsx';

const CLASS_NAME = 'CLASS_NAME';
const PROVISION = 'PROVISION_EXAMPLE';

const Presenter = () => <div className={CLASS_NAME} />;

let requireProvision;
let resolveProvision;
let provide;
beforeEach(() => {
  requireProvision = jest.fn(() => Promise.resolve());
  resolveProvision = jest.fn(() => PROVISION);
  provide = createProvider({
    requireProvision,
    resolveProvision,
    requirementsComparator: (a, b) => a === b,
  });
});

describe('Provider', () => {
  it('should render wrapped component', () => {
    const WrappedComponent = provide(Presenter);
    expect(
      shallow(<WrappedComponent />)
        .dive()
        .hasClass(CLASS_NAME),
    ).toBe(true);
  });

  it('should require provision on first mount', () => {
    const WrappedComponent = provide(Presenter);
    const requirements = 'requirements';
    const props = { requirements };
    shallow(<WrappedComponent {...props} />).dive();
    expect(requireProvision.mock.calls).toEqual([
      [expect.objectContaining(props)],
    ]);
  });

  it('should require provision on update if requirements is changed', () => {
    const WrappedComponent = provide(Presenter);
    const propsA = { requirements: 'requirementsA' };
    const propsB = { requirements: 'requirementsB' };
    const instance = shallow(<WrappedComponent {...propsA} />);
    instance.setProps(propsB);
    expect(requireProvision.mock.calls).toEqual([
      [expect.objectContaining(propsA)],
      [expect.objectContaining(propsB)],
    ]);
  });

  it('should not require provision on update if requirements is equal', () => {
    const WrappedComponent = provide(Presenter);
    const props = { requirements: 'requirements' };
    const instance = shallow(<WrappedComponent {...props} />);
    instance.setProps({
      requirements: props.requirements,
      whateverToEnsureUpdate: true,
    });
    expect(requireProvision.mock.calls).toEqual([
      [expect.objectContaining(props)],
    ]);
  });

  it('should pass provision prop to wrapped component, gained from resolveProvision func', () => {
    const WrappedComponent = provide(Presenter);
    const props = shallow(
      <WrappedComponent requirements="does not matter" />,
    ).props();
    expect(props).toEqual(expect.objectContaining({ provision: PROVISION }));
  });
});
