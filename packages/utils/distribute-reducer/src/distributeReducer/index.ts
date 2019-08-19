import { IReducer, IDomainCompositeState } from '../interface';
import createWindowedReducer from './createWindowedReducer';
import createRecursiveReducer from './createRecursiveReducer';

export default <IOriginalReducer extends IReducer<IDomainState>, IDomainState>(
  originalReducer: IOriginalReducer,
) =>
  createWindowedReducer<
    IReducer<IDomainCompositeState<IDomainState>>,
    IDomainState
  >(createRecursiveReducer<IOriginalReducer, IDomainState>(originalReducer));
