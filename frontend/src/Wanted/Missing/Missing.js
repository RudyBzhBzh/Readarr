import PropTypes from 'prop-types';
import React, { Component } from 'react';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import FilterMenu from 'Components/Menu/FilterMenu';
import ConfirmModal from 'Components/Modal/ConfirmModal';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import PageToolbar from 'Components/Page/Toolbar/PageToolbar';
import PageToolbarButton from 'Components/Page/Toolbar/PageToolbarButton';
import PageToolbarSection from 'Components/Page/Toolbar/PageToolbarSection';
import PageToolbarSeparator from 'Components/Page/Toolbar/PageToolbarSeparator';
import Table from 'Components/Table/Table';
import TableBody from 'Components/Table/TableBody';
import TablePager from 'Components/Table/TablePager';
import { align, icons, kinds } from 'Helpers/Props';
import InteractiveImportModal from 'InteractiveImport/InteractiveImportModal';
import getFilterValue from 'Utilities/Filter/getFilterValue';
import hasDifferentItems from 'Utilities/Object/hasDifferentItems';
import translate from 'Utilities/String/translate';
import getSelectedIds from 'Utilities/Table/getSelectedIds';
import removeOldSelectedState from 'Utilities/Table/removeOldSelectedState';
import selectAll from 'Utilities/Table/selectAll';
import toggleSelected from 'Utilities/Table/toggleSelected';
import MissingRowConnector from './MissingRowConnector';

function getMonitoredValue(props) {
  const {
    filters,
    selectedFilterKey
  } = props;

  return getFilterValue(filters, selectedFilterKey, 'monitored', false);
}

class Missing extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      allSelected: false,
      allUnselected: false,
      lastToggled: null,
      selectedState: {},
      isConfirmSearchAllMissingModalOpen: false,
      isInteractiveImportModalOpen: false
    };
  }

  componentDidUpdate(prevProps) {
    if (hasDifferentItems(prevProps.items, this.props.items)) {
      this.setState((state) => {
        return removeOldSelectedState(state, prevProps.items);
      });
    }
  }

  //
  // Control

  getSelectedIds = () => {
    return getSelectedIds(this.state.selectedState);
  };

  //
  // Listeners

  onSelectAllChange = ({ value }) => {
    this.setState(selectAll(this.state.selectedState, value));
  };

  onSelectedChange = ({ id, value, shiftKey = false }) => {
    this.setState((state) => {
      return toggleSelected(state, this.props.items, id, value, shiftKey);
    });
  };

  onSearchSelectedPress = () => {
    const selected = this.getSelectedIds();

    this.props.onSearchSelectedPress(selected);
  };

  onToggleSelectedPress = () => {
    const bookIds = this.getSelectedIds();

    this.props.batchToggleMissingBooks({
      bookIds,
      monitored: !getMonitoredValue(this.props)
    });
  };

  onSearchAllMissingPress = () => {
    this.setState({ isConfirmSearchAllMissingModalOpen: true });
  };

  onSearchAllMissingConfirmed = () => {
    this.props.onSearchAllMissingPress();
    this.setState({ isConfirmSearchAllMissingModalOpen: false });
  };

  onConfirmSearchAllMissingModalClose = () => {
    this.setState({ isConfirmSearchAllMissingModalOpen: false });
  };

  onInteractiveImportPress = () => {
    this.setState({ isInteractiveImportModalOpen: true });
  };

  onInteractiveImportModalClose = () => {
    this.setState({ isInteractiveImportModalOpen: false });
  };

  //
  // Render

  render() {
    const {
      isFetching,
      isPopulated,
      error,
      items,
      isAuthorFetching,
      isAuthorPopulated,
      selectedFilterKey,
      filters,
      columns,
      totalRecords,
      isSearchingForMissingBooks,
      isSaving,
      onFilterSelect,
      ...otherProps
    } = this.props;

    const {
      allSelected,
      allUnselected,
      selectedState,
      isConfirmSearchAllMissingModalOpen,
      isInteractiveImportModalOpen
    } = this.state;

    const isAllPopulated = isPopulated && isAuthorPopulated;
    const isAnyFetching = isFetching || isAuthorFetching;

    const itemsSelected = !!this.getSelectedIds().length;
    const isShowingMonitored = getMonitoredValue(this.props);

    return (
      <PageContent title={translate('Missing')}>
        <PageToolbar>
          <PageToolbarSection>
            <PageToolbarButton
              label={translate('SearchSelected')}
              iconName={icons.SEARCH}
              isDisabled={!itemsSelected || isSearchingForMissingBooks}
              onPress={this.onSearchSelectedPress}
            />

            <PageToolbarButton
              label={isShowingMonitored ? translate('IsShowingMonitoredUnmonitorSelected') : translate('IsShowingMonitoredMonitorSelected')}
              iconName={isShowingMonitored ? icons.UNMONITORED : icons.MONITORED}
              isDisabled={!itemsSelected}
              isSpinning={isSaving}
              onPress={this.onToggleSelectedPress}
            />

            <PageToolbarSeparator />

            <PageToolbarButton
              label={translate('SearchAll')}
              iconName={icons.SEARCH}
              isDisabled={!items.length}
              isSpinning={isSearchingForMissingBooks}
              onPress={this.onSearchAllMissingPress}
            />

            <PageToolbarSeparator />

            <PageToolbarButton
              label={translate('ManualImport')}
              iconName={icons.INTERACTIVE}
              onPress={this.onInteractiveImportPress}
            />

          </PageToolbarSection>

          <PageToolbarSection alignContent={align.RIGHT}>
            <FilterMenu
              alignMenu={align.RIGHT}
              selectedFilterKey={selectedFilterKey}
              filters={filters}
              customFilters={[]}
              onFilterSelect={onFilterSelect}
            />
          </PageToolbarSection>
        </PageToolbar>

        <PageContentBody>
          {
            isAnyFetching && !isAllPopulated &&
              <LoadingIndicator />
          }

          {
            !isAnyFetching && error &&
              <div>
                Error fetching missing items
              </div>
          }

          {
            isAllPopulated && !error && !items.length &&
              <div>
                No missing items
              </div>
          }

          {
            isAllPopulated && !error && !!items.length &&
              <div>
                <Table
                  columns={columns}
                  selectAll={true}
                  allSelected={allSelected}
                  allUnselected={allUnselected}
                  {...otherProps}
                  onSelectAllChange={this.onSelectAllChange}
                >
                  <TableBody>
                    {
                      items.map((item) => {
                        return (
                          <MissingRowConnector
                            key={item.id}
                            isSelected={selectedState[item.id]}
                            columns={columns}
                            {...item}
                            onSelectedChange={this.onSelectedChange}
                          />
                        );
                      })
                    }
                  </TableBody>
                </Table>

                <TablePager
                  totalRecords={totalRecords}
                  isFetching={isFetching}
                  {...otherProps}
                />

                <ConfirmModal
                  isOpen={isConfirmSearchAllMissingModalOpen}
                  kind={kinds.DANGER}
                  title={translate('SearchForAllMissingBooks')}
                  message={
                    <div>
                      <div>
                        Are you sure you want to search for all {totalRecords} missing books?
                      </div>
                      <div>
                        This cannot be cancelled once started without restarting Readarr.
                      </div>
                    </div>
                  }
                  confirmLabel={translate('Search')}
                  onConfirm={this.onSearchAllMissingConfirmed}
                  onCancel={this.onConfirmSearchAllMissingModalClose}
                />
              </div>
          }

          <InteractiveImportModal
            isOpen={isInteractiveImportModalOpen}
            onModalClose={this.onInteractiveImportModalClose}
            showReplaceExistingFiles={true}
          />
        </PageContentBody>
      </PageContent>
    );
  }
}

Missing.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  isPopulated: PropTypes.bool.isRequired,
  error: PropTypes.object,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  isAuthorFetching: PropTypes.bool.isRequired,
  isAuthorPopulated: PropTypes.bool.isRequired,
  selectedFilterKey: PropTypes.string.isRequired,
  filters: PropTypes.arrayOf(PropTypes.object).isRequired,
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  totalRecords: PropTypes.number,
  isSearchingForMissingBooks: PropTypes.bool.isRequired,
  isSaving: PropTypes.bool.isRequired,
  onFilterSelect: PropTypes.func.isRequired,
  onSearchSelectedPress: PropTypes.func.isRequired,
  batchToggleMissingBooks: PropTypes.func.isRequired,
  onSearchAllMissingPress: PropTypes.func.isRequired
};

export default Missing;
