import React from 'react';
import PropTypes from 'prop-types';
import isDeepEqual from 'deep-equal';

export default ({
  requireProvision,
  resolveProvision,
  equalityMatcher = isDeepEqual,
  shouldSpreadProvisionInWrapperProps = false,
  propsAdapter = props => props,
}) => ({
  mapPropsToRequirements = ({ requirements }) => requirements,
} = {}) => WrappedComponent => {
  class Provider extends React.Component {
    static propTypes = {
      onRequest: PropTypes.func,
    };

    static defaultProps = {
      onRequest: () => {},
    };

    static getDerivedStateFromProps(nextProps) {
      const requirements = mapPropsToRequirements(nextProps);
      return {
        requirements,
        provision: resolveProvision(requirements, nextProps),
      };
    }

    constructor(props, context) {
      super(props, context);
      this.state = {
        requirements: undefined,
        provision: undefined,
      };
    }

    componentDidMount() {
      this.require();
    }

    componentDidUpdate(prevProps, prevState) {
      const { requirements: prevRequirements } = prevState;
      const { requirements: nextRequirements } = this.state;

      if (!equalityMatcher(prevRequirements, nextRequirements)) {
        this.require();
      }
    }

    require() {
      const { onRequest: handleRequest } = this.props;

      const { requirements } = this.state;

      handleRequest(requireProvision(requirements, this.props));
    }

    render() {
      const { provision } = this.state;

      const provisionObject = shouldSpreadProvisionInWrapperProps
        ? provision
        : { provision };
      return (
        <WrappedComponent {...propsAdapter(this.props)} {...provisionObject} />
      );
    }
  }

  const internalName =
    WrappedComponent.displayName || WrappedComponent.name || 'Component';
  Provider.displayName = `Provided(${internalName})`;

  return Provider;
};
