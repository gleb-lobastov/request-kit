import React from 'react';

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
type Forbid<T> = { [P in keyof T]: never };

type TRequirements = any;
type TProvision = any;

interface IRequirementsProps {
  readonly requirements: TRequirements;
}

interface IConsumedProps extends IRequirementsProps {
  onRequest?: (request: Promise<any>) => void;
}

interface IInjectedProps {
  readonly provision: TProvision;
}

export interface IProviderOptions<ICallbackProps> {
  requireProvision: (props: ICallbackProps) => Promise<any>;
  resolveProvision: (props: ICallbackProps) => TProvision;
  requirementsComparator: (a: TRequirements, b: TRequirements) => boolean;
  propsToOmit?: Array<keyof (ICallbackProps & IConsumedProps)>;
}

// todo memoize
const omit = <T, K extends keyof T>(object: T, attrs: Array<K>): Omit<T, K> => {
  return Object.entries(object).reduce((result: any, [key, value]) => {
    if (!attrs.includes(key as K)) {
      result[key] = value;
    }
    return result;
  }, {});
};

export default <ICallbackProps extends IRequirementsProps>({
  requireProvision,
  resolveProvision,
  requirementsComparator,
  propsToOmit = [],
}: IProviderOptions<ICallbackProps>) => <
  IInputProps extends IConsumedProps & ICallbackProps & Forbid<IInjectedProps>
>(
  WrappedComponent: React.ComponentType<
    IInjectedProps & Omit<IInputProps, keyof (IConsumedProps & ICallbackProps)>
  >,
) =>
  class extends React.Component<IInputProps> {
    static displayName = `Provided(${WrappedComponent.displayName ||
      WrappedComponent.name ||
      'WrappedComponent'})`;

    componentDidMount(): void {
      this.require();
    }

    componentDidUpdate(prevProps: IInputProps): void {
      const { requirements: prevRequirements } = prevProps;
      const { requirements: nextRequirements, provision } = this.props;

      if (!requirementsComparator(prevRequirements, nextRequirements)) {
        this.require();
      }
    }

    require(): void {
      const { onRequest: handleRequest } = this.props;
      const response = requireProvision(this.props);

      if (handleRequest) {
        handleRequest(response);
      }
    }

    render(): any {
      const actualProps = propsToOmit
        ? omit<IInputProps, keyof (IConsumedProps & ICallbackProps)>(
            this.props,
            propsToOmit,
          )
        : this.props;

      return (
        <WrappedComponent
          provision={resolveProvision(this.props)}
          {...actualProps}
        />
      );
    }
  };
