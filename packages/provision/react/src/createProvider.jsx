import React from 'react';
import debounce from 'lodash/debounce';

export default ({
  requirementsComparator: compareRequirements,
  transformProps = props => props,
  request,
}) => WrappedComponent => {
  let preservedRequirements; // keep observable between remounts

  return class extends React.Component {
    static displayName = `Provided(${WrappedComponent.displayName ||
      WrappedComponent.name ||
      'WrappedComponent'})`;

    constructor(props) {
      super(props);
      const { requirements: { debounceRequest } = {} } = this.props;
      if (debounceRequest) {
        // todo: return correct promise
        this.request = debounce(this.request, debounceRequest);
      }
    }

    componentDidMount() {
      const { requirements, provision } = this.props;
      const comparisonResult = compareRequirements(
        { requirements: preservedRequirements },
        { requirements, provision },
      );
      if (comparisonResult) {
        this.request(comparisonResult);
      }
    }

    componentDidUpdate(prevProps) {
      const {
        requirements: prevRequirements,
        provision: prevProvision,
      } = prevProps;
      const {
        requirements: nextRequirements,
        provision: nextProvision,
      } = this.props;

      const comparisonResult = compareRequirements(
        { requirements: prevRequirements, provision: prevProvision },
        { requirements: nextRequirements, provision: nextProvision },
      );

      if (comparisonResult) {
        this.request(comparisonResult);
      }
    }

    request(comparisonResult) {
      const { requirements, onRequest: handleRequest } = this.props;
      preservedRequirements = requirements;

      const response = request({
        ...this.props,
        requirements: { ...requirements, comparisonResult },
      });

      if (handleRequest) {
        handleRequest(response);
      }
    }

    render() {
      return <WrappedComponent {...transformProps(this.props)} />;
    }
  };
};
