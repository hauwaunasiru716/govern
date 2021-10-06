import styled from 'styled-components';
import { ApmRoute } from '@elastic/apm-rum-react';
import { Grid, GridItem, GU, useLayout } from '@aragon/ui';
import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { Redirect, Switch, useHistory, useLocation, useParams, useRouteMatch } from 'react-router';

import DaoSideCard from './components/DaoSideCard/DaoSideCard';
import NewExecution from 'containers/NewExecution/NewExecution';
import HelpComponent from 'components/HelpComponent/HelpComponent';
import DaoActionsPage from './DaoActionPage';
import DaoFinancePage from './DaoFinancePage';
import ProposalDetails from 'containers/ProposalDetails/ProposalDetails';
import { useDaoQuery, useLazyProposalListQuery } from 'hooks/query-hooks';
const DaoSettings = lazy(() => import('containers/DAOSettings/DAOSettings'));

const StyledGridItem = styled(GridItem)<{ paddingTop: string }>`
  padding-top: ${({ paddingTop }) => paddingTop};
`;

/**
 * Main page taking care of the routing to various dao functions;
 * pulls all the data (for now at least)
 */
const DaoHomePage: React.FC = () => {
  const history = useHistory();
  const { daoName } = useParams<any>();
  const { pathname } = useLocation();
  const { path, url } = useRouteMatch();
  const { layoutName } = useLayout();
  const layoutIsSmall = useMemo(() => layoutName === 'small', [layoutName]);

  /**
   * State
   */
  const [daoExists, setDaoExists] = useState<boolean>(true);
  const [IsMoreActions, setIsMoreActions] = useState<boolean>(false);

  // TODO: check if used
  const [daoDetails, setDaoDetails] = useState<any>();
  const [queueNonce, setQueueNonce] = useState<number>();
  const [visibleActions, setVisibleActions] = useState<any>([]);

  /**
   * Effects
   */
  const { data: dao, loading: daoIsLoading } = useDaoQuery(daoName);
  const { getQueueData, data: queueData, fetchMore } = useLazyProposalListQuery();

  /**
   * Update state and get queue data
   */
  useEffect(() => {
    if (daoIsLoading) return;

    if (dao && getQueueData) {
      setDaoExists(true);

      if (dao.queue) {
        getQueueData({
          variables: {
            offset: 0,
            limit: 100,
            id: dao.queue.id,
          },
        });
      }
    } else {
      setDaoExists(false);
    }
  }, [daoIsLoading, dao, getQueueData]);

  /**
   * Functions
   */
  const fetchMoreData = async () => {
    if (fetchMore) {
      fetchMore({
        variables: {
          offset: visibleActions.length,
        },
      });
    }
  };

  /**
   * Update visible proposals
   */
  useEffect(() => {
    if (queueData) {
      setVisibleActions(queueData.governQueue.containers);
    }
  }, [queueData]);

  useEffect(() => {
    if (queueNonce && visibleActions.length) {
      setIsMoreActions(queueNonce !== visibleActions.length);
    } else setIsMoreActions(false);
  }, [queueNonce, visibleActions]);

  /**
   * Render
   */
  if (daoIsLoading) {
    return <div>Loading...</div>;
  }

  if (!daoExists) {
    history.replace('/daos/not-found');
  }

  // TODO: Set API call to get open action(scheduled + executable)
  return (
    <Grid layout={true} gap={24}>
      <GridItem gridColumn={layoutIsSmall ? '1/-1' : '1/5'}>
        <DaoSideCard address={dao?.queue?.address} baseUrl={url} identifier={daoName} />
      </GridItem>
      <StyledGridItem
        gridRow={layoutIsSmall ? '2/4' : '1/4'}
        gridColumn={layoutIsSmall ? '1/-1' : '5/17'}
        paddingTop={layoutIsSmall ? '0px' : `${3 * GU}px`}
      >
        <Suspense fallback={<div>Loading...</div>}>
          <Switch>
            <Redirect exact from={path} to={`${path}actions`} />
            <ApmRoute
              exact
              path={`${path}actions`}
              render={() => (
                <DaoActionsPage
                  fetchMore={fetchMoreData}
                  actions={visibleActions}
                  isMore={IsMoreActions}
                  daoName={daoName}
                />
              )}
            />
            <ApmRoute
              exact
              path={`${path}finance`}
              render={() => (
                <DaoFinancePage
                  daoName={daoName}
                  executorId={dao?.executor.id}
                  token={dao?.token}
                />
              )}
            />
            <ApmRoute exact path={`${path}settings`} component={DaoSettings} />
            <ApmRoute exact path={`${path}actions/executions/:id`} component={ProposalDetails} />
            <ApmRoute exact path={`${path}actions/new`} component={NewExecution} />

            {/* TODO: Operation not found page */}
            <ApmRoute render={() => <div>Operation not found on dao. Go home?</div>} />
          </Switch>
        </Suspense>
      </StyledGridItem>
      {(pathname === `${url}/settings` || pathname === `${url}/actions/new`) && (
        <GridItem
          gridRow={layoutIsSmall ? '4/5' : '2/3'}
          gridColumn={layoutIsSmall ? '1/-1' : '1/5'}
        >
          <HelpComponent />
        </GridItem>
      )}
    </Grid>
  );
};

export default DaoHomePage;