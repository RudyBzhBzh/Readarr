import PropTypes from 'prop-types';
import React from 'react';
import Link from 'Components/Link/Link';
import { inputTypes } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
// import translate from 'Utilities/String/translate';
import AutoCompleteInput from './AutoCompleteInput';
import BookEditionSelectInputConnector from './BookEditionSelectInputConnector';
import BookshelfInputConnector from './BookshelfInputConnector';
import CaptchaInputConnector from './CaptchaInputConnector';
import CheckInput from './CheckInput';
import DeviceInputConnector from './DeviceInputConnector';
import EnhancedSelectInput from './EnhancedSelectInput';
import EnhancedSelectInputConnector from './EnhancedSelectInputConnector';
import FormInputHelpText from './FormInputHelpText';
import IndexerSelectInputConnector from './IndexerSelectInputConnector';
import KeyValueListInput from './KeyValueListInput';
import MetadataProfileSelectInputConnector from './MetadataProfileSelectInputConnector';
import MonitorBooksSelectInput from './MonitorBooksSelectInput';
import MonitorNewItemsSelectInput from './MonitorNewItemsSelectInput';
import NumberInput from './NumberInput';
import OAuthInputConnector from './OAuthInputConnector';
import PasswordInput from './PasswordInput';
import PathInputConnector from './PathInputConnector';
import QualityProfileSelectInputConnector from './QualityProfileSelectInputConnector';
import RootFolderSelectInputConnector from './RootFolderSelectInputConnector';
import TagInputConnector from './TagInputConnector';
import TextArea from './TextArea';
import TextInput from './TextInput';
import TextTagInputConnector from './TextTagInputConnector';
import UMaskInput from './UMaskInput';
import styles from './FormInputGroup.css';

function getComponent(type) {
  switch (type) {
    case inputTypes.AUTO_COMPLETE:
      return AutoCompleteInput;

    case inputTypes.CAPTCHA:
      return CaptchaInputConnector;

    case inputTypes.CHECK:
      return CheckInput;

    case inputTypes.DEVICE:
      return DeviceInputConnector;

    case inputTypes.BOOKSHELF:
      return BookshelfInputConnector;

    case inputTypes.KEY_VALUE_LIST:
      return KeyValueListInput;

    case inputTypes.MONITOR_BOOKS_SELECT:
      return MonitorBooksSelectInput;

    case inputTypes.MONITOR_NEW_ITEMS_SELECT:
      return MonitorNewItemsSelectInput;

    case inputTypes.NUMBER:
      return NumberInput;

    case inputTypes.OAUTH:
      return OAuthInputConnector;

    case inputTypes.PASSWORD:
      return PasswordInput;

    case inputTypes.PATH:
      return PathInputConnector;

    case inputTypes.QUALITY_PROFILE_SELECT:
      return QualityProfileSelectInputConnector;

    case inputTypes.METADATA_PROFILE_SELECT:
      return MetadataProfileSelectInputConnector;

    case inputTypes.BOOK_EDITION_SELECT:
      return BookEditionSelectInputConnector;

    case inputTypes.INDEXER_SELECT:
      return IndexerSelectInputConnector;

    case inputTypes.ROOT_FOLDER_SELECT:
      return RootFolderSelectInputConnector;

    case inputTypes.SELECT:
      return EnhancedSelectInput;

    case inputTypes.DYNAMIC_SELECT:
      return EnhancedSelectInputConnector;

    case inputTypes.TAG:
      return TagInputConnector;

    case inputTypes.TEXT_AREA:
      return TextArea;

    case inputTypes.TEXT_TAG:
      return TextTagInputConnector;

    case inputTypes.UMASK:
      return UMaskInput;

    default:
      return TextInput;
  }
}

function FormInputGroup(props) {
  const {
    className,
    containerClassName,
    inputClassName,
    type,
    unit,
    buttons,
    helpText,
    helpTexts,
    helpTextWarning,
    helpLink,
    pending,
    errors,
    warnings,
    ...otherProps
  } = props;

  const InputComponent = getComponent(type);
  const checkInput = type === inputTypes.CHECK;
  const hasError = !!errors.length;
  const hasWarning = !hasError && !!warnings.length;
  const buttonsArray = React.Children.toArray(buttons);
  const lastButtonIndex = buttonsArray.length - 1;
  const hasButton = !!buttonsArray.length;

  return (
    <div className={containerClassName}>
      <div className={className}>
        <div className={styles.inputContainer}>
          <InputComponent
            className={inputClassName}
            helpText={helpText}
            helpTextWarning={helpTextWarning}
            hasError={hasError}
            hasWarning={hasWarning}
            hasButton={hasButton}
            {...otherProps}
          />

          {
            unit &&
              <div
                className={
                  type === inputTypes.NUMBER ?
                    styles.inputUnitNumber :
                    styles.inputUnit
                }
              >
                {unit}
              </div>
          }
        </div>

        {
          buttonsArray.map((button, index) => {
            return React.cloneElement(
              button,
              {
                isLastButton: index === lastButtonIndex
              }
            );
          })
        }

        {/* <div className={styles.pendingChangesContainer}>
          {
          pending &&
          <Icon
          name={icons.UNSAVED_SETTING}
          className={styles.pendingChangesIcon}
          title={translate('ChangeHasNotBeenSavedYet')}
          />
          }
        </div> */}
      </div>

      {
        !checkInput && helpText &&
          <FormInputHelpText
            text={helpText}
          />
      }

      {
        !checkInput && helpTexts &&
          <div>
            {
              helpTexts.map((text, index) => {
                return (
                  <FormInputHelpText
                    key={index}
                    text={text}
                    isCheckInput={checkInput}
                  />
                );
              })
            }
          </div>
      }

      {
        (!checkInput || helpText) && helpTextWarning &&
          <FormInputHelpText
            text={helpTextWarning}
            isWarning={true}
          />
      }

      {
        helpLink &&
          <Link
            to={helpLink}
          >
            {translate('MoreInfo')}
          </Link>
      }

      {
        errors.map((error, index) => {
          return (
            <FormInputHelpText
              key={index}
              text={error.message}
              link={error.link}
              tooltip={error.detailedMessage}
              isError={true}
              isCheckInput={checkInput}
            />
          );
        })
      }

      {
        warnings.map((warning, index) => {
          return (
            <FormInputHelpText
              key={index}
              text={warning.message}
              link={warning.link}
              tooltip={warning.detailedMessage}
              isWarning={true}
              isCheckInput={checkInput}
            />
          );
        })
      }
    </div>
  );
}

FormInputGroup.propTypes = {
  className: PropTypes.string.isRequired,
  containerClassName: PropTypes.string.isRequired,
  inputClassName: PropTypes.string,
  type: PropTypes.string.isRequired,
  unit: PropTypes.string,
  buttons: PropTypes.oneOfType([PropTypes.node, PropTypes.arrayOf(PropTypes.node)]),
  helpText: PropTypes.string,
  helpTexts: PropTypes.arrayOf(PropTypes.string),
  helpTextWarning: PropTypes.string,
  helpLink: PropTypes.string,
  pending: PropTypes.bool,
  errors: PropTypes.arrayOf(PropTypes.object),
  warnings: PropTypes.arrayOf(PropTypes.object)
};

FormInputGroup.defaultProps = {
  className: styles.inputGroup,
  containerClassName: styles.inputGroupContainer,
  type: inputTypes.TEXT,
  buttons: [],
  helpTexts: [],
  errors: [],
  warnings: []
};

export default FormInputGroup;
