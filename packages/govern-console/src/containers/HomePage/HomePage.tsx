import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { useHistory } from 'react-router-dom';
import { styled } from '@material-ui/core/styles';

import Header from 'components/Header/Header';
// import NavigationBar from '../../components/Navigation';
import ConsoleMainPage from 'containers/Console/ConsoleMainPage';
import DaoMainPage from 'containers/DAO/DaoMainPage';
import ProposalDetails from 'containers/ProposalDetails/ProposalDetails';
import NewProposal from 'containers/NewProposal/NewProposal';
import NewDaoContainer from 'containers/CreateDAO/CreateDAO';

const HomePage = ({ ...props }) => {
  const AppWrapper = styled('div')({
    width: 'calc(100vw - 96px)',
    margin: 'auto',
  });
  const history = useHistory();
  debugger;
  const [selectedDao, updateSelectedDao] = React.useState<any>({});
  const [selectedProposal, updateSelectedProposal] = React.useState<any>({});

  const updateSelectedDaoAndPushToHistory = React.useCallback(
    (daoDetails: any) => {
      updateSelectedDao(daoDetails);
      sessionStorage.setItem('selectedDao', JSON.stringify(daoDetails));
      history.push(`/daos/${daoDetails.name}`);
    },
    [history],
  );
  const onClickProposalCard = React.useCallback(
    (proposalDetails: any) => {
      history.push(`/proposals/${proposalDetails.id}`);
      sessionStorage.setItem(
        'selectedProposal',
        JSON.stringify(proposalDetails),
      );
      updateSelectedProposal(proposalDetails);
    },
    [history],
  );
  const onClickNewProposal = React.useCallback(() => {
    debugger;
    history.push(`/${selectedDao.name}/new-proposal`);
  }, [history, selectedDao]);

  const onClickBackFromProposalPage = () => {
    history.goBack();
  };

  return (
    <AppWrapper>
      <Header />
      {/* add breadcrumbs later */}
      <Switch>
        <div>
          <Route exact path="/">
            <ConsoleMainPage
              updateSelectedDao={updateSelectedDaoAndPushToHistory}
            />
          </Route>
          <Route exact path="/daos/:daoName">
            <DaoMainPage
              daoDetails={selectedDao}
              onClickProposalCard={onClickProposalCard}
              onClickNewProposal={onClickNewProposal}
            />
          </Route>
          <Route exact path="/proposals/:id">
            <ProposalDetails
              selectedProposal={selectedProposal}
              onClickBack={onClickBackFromProposalPage}
            />
          </Route>
          <Route exact path="/:daoName/new-proposal">
            <NewProposal />
          </Route>
          <Route exact path="/create-dao">
            <NewDaoContainer />
          </Route>
          {/* <Route path="/about">
        <About />
      </Route>
      <Route path="/dashboard">
        <Dashboard />
      </Route>
    */}
        </div>
      </Switch>
      {/* <Footer /> */}
    </AppWrapper>
  );
};

export default HomePage;