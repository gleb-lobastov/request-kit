import React from 'react';

export default ({
  requireProvision,
  resolveProvision,
  equalityMatcher = (a, b) => a === b,
  shouldSpreadProvisionInWrapperProps = false,
  propsAdapter = props => props,
}) => (
  provisionConfig,
) => {
  const mapPropsToRequirements = (
    typeof provisionConfig === 'function' ? provisionConfig : () => provisionConfig
  );

  return (WrappedComponent) => {
    class Provider extends React.Component {
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
        const {
          requirements: prevRequirements,
        } = prevState;
        const {
          requirements: nextRequirements,
        } = this.state;
        if (!equalityMatcher(prevRequirements, nextRequirements)) {
          this.require();
        }
      }

      require() {
        const {
          requirements,
        } = this.state;
        requireProvision(requirements, this.props);
      }

      render() {
        const {
          provision,
        } = this.state;

        const provisionObject = shouldSpreadProvisionInWrapperProps ? provision : { provision };
        return (
          <WrappedComponent
            {...propsAdapter(this.props)}
            {...provisionObject}
          />
        );
      }
    }

    const internalName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
    Provider.displayName = `Provided(${internalName})`;

    return Provider;
  };
};
