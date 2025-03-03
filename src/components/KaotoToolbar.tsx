import { fetchDefaultNamespace, startDeployment } from '@kaoto/api';
import {
  AppearanceModal,
  ConfirmationModal,
  DeploymentsModal,
  SettingsModal,
} from '@kaoto/components';
import { isNameValidCheck } from '@kaoto/services';
import {
  useDeploymentStore,
  useIntegrationJsonStore,
  useIntegrationSourceStore,
  useSettingsStore,
} from '@kaoto/store';
import {
  AlertVariant,
  Button,
  Dropdown,
  DropdownItem,
  DropdownPosition,
  DropdownSeparator,
  DropdownToggle,
  InputGroup,
  KebabToggle,
  OverflowMenu,
  OverflowMenuControl,
  TextInput,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Tooltip,
} from '@patternfly/react-core';
import {
  BarsIcon,
  BellIcon,
  CatalogIcon,
  CheckIcon,
  CodeIcon,
  CubesIcon,
  PencilAltIcon,
  TimesIcon,
} from '@patternfly/react-icons';
import { useAlert } from '@rhoas/app-services-ui-shared';
import { useCallback, useEffect, useState } from 'react';

export interface IKaotoToolbar {
  toggleCatalog: () => void;
  toggleCodeEditor: () => void;
}

export const KaotoToolbar = ({ toggleCatalog, toggleCodeEditor }: IKaotoToolbar) => {
  const { settings, setSettings } = useSettingsStore((state) => state);
  const { sourceCode, setSourceCode } = useIntegrationSourceStore((state) => state);
  const deleteIntegration = useIntegrationJsonStore((state) => state.deleteIntegration);

  const { deployment, setDeploymentCrd } = useDeploymentStore();
  const [kebabIsOpen, setKebabIsOpen] = useState(false);
  const [appMenuIsOpen, setAppMenuIsOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const focusIntegrationInput = useCallback(( element: HTMLInputElement ) => {
    element?.focus();
  }, []);
  const [localName, setLocalName] = useState(settings.name);
  const [nameValidation, setNameValidation] = useState<
    'default' | 'warning' | 'success' | 'error' | undefined
  >('default');
  const [expanded, setExpanded] = useState({
    appearanceModal: false,
    deploymentsModal: false,
    settingsModal: false,
  });

  const { addAlert } = useAlert() || {};

  // change in name from elsewhere should update local value
  // otherwise, on edit it will show the old value
  useEffect(() => {
    setLocalName(settings.name);
  }, [settings.name]);
  // fetch default namespace from the API,
  useEffect(() => {
    fetchDefaultNamespace().then((data) => {
      const newSettings = settings;
      newSettings.namespace = data.namespace;
      setSettings(newSettings);
    });
  }, []);

  // fetch default namespace from the API,
  useEffect(() => {
    fetchDefaultNamespace().then((data) => {
      const newSettings = settings;
      newSettings.namespace = data.namespace;
      setSettings(newSettings);
    });
  }, []);

  const handleDeployStartClick = () => {
    startDeployment(sourceCode, settings.name, settings.namespace)
      .then((res) => {
        setDeploymentCrd(res);

        addAlert &&
          addAlert({
            title: 'Deployment started',
            variant: AlertVariant.success,
            description: 'Your integration is deploying..',
          });
      })
      .catch((e) => {
        console.log('error deploying integration: ', e);
        addAlert &&
          addAlert({
            title: 'Deployment not started',
            variant: AlertVariant.warning,
            description: 'There was a problem deploying your integration. Please try again later.',
          });
      });
  };

  const onFocusAppMenu = () => {
    const element = document.getElementById('toggle-icon-only');
    element?.focus();
  };

  const onSelectAppMenu = () => {
    setAppMenuIsOpen(false);
    onFocusAppMenu();
  };

  const deployable = settings.dsl.deployable === 'true' ? 'true' : undefined;

  const appMenuItems = [
    <DropdownItem
      key="deployments"
      description="Integrations that are currently running"
      icon={<CubesIcon />}
      onClick={() => {
        setExpanded({ ...expanded, deploymentsModal: !expanded.deploymentsModal });
      }}
    >
      Deployments
    </DropdownItem>,
    <DropdownItem
      key="integrations"
      component="button"
      icon={<BellIcon />}
      description="Your saved integrations"
      isDisabled
    >
      Integrations (coming soon)
    </DropdownItem>,
    <DropdownSeparator key="separator" />,
    <DropdownItem key="clusters" isDisabled>
      Clusters (coming soon)
    </DropdownItem>,
    <DropdownItem key="projects" component="button" isDisabled>
      Projects (coming soon)
    </DropdownItem>,
  ];

  const kebabItems = [
    <DropdownItem
      key="settings"
      data-testid={'kaotoToolbar-kebab__settings'}
      onClick={() => setExpanded({ ...expanded, settingsModal: !expanded.settingsModal })}
    >
      Settings
    </DropdownItem>,
    <DropdownItem
      key="appearance"
      data-testid={'kaotoToolbar-kebab__appearance'}
      onClick={() => setExpanded({ ...expanded, appearanceModal: !expanded.appearanceModal })}
    >
      Appearance
    </DropdownItem>,
    <DropdownSeparator key="separator-01" />,
    <DropdownItem key="tutorial" isDisabled>
      Tutorial
    </DropdownItem>,
    <DropdownItem key="help" isDisabled>
      Help
    </DropdownItem>,
    <DropdownItem key="feedback" isDisabled>
      Feedback
    </DropdownItem>,
    <DropdownSeparator key="separator-02" />,
    <DropdownItem key="delete" component="button" onClick={() => setIsConfirmationModalOpen(true)}>
      Delete
    </DropdownItem>,
  ];

  return (
    <>
      <Toolbar className={'viz-toolbar'} data-testid={'viz-toolbar'}>
        <ToolbarContent>
          {/* APP MENU */}
          <ToolbarItem>
            <Dropdown
              onSelect={onSelectAppMenu}
              toggle={
                <DropdownToggle
                  toggleIndicator={null}
                  onToggle={(e) => setAppMenuIsOpen(e)}
                  aria-label="Applications"
                  id="toggle-icon-only"
                >
                  <BarsIcon />
                </DropdownToggle>
              }
              isOpen={appMenuIsOpen}
              isPlain
              dropdownItems={appMenuItems}
            />
          </ToolbarItem>

          <ToolbarItem variant="separator" />

          {/* STEP CATALOG BUTTON */}
          <ToolbarItem>
            <Tooltip content={<div>Step Catalog</div>} position={'bottom'}>
              <Button
                tabIndex={0}
                variant="link"
                data-testid={'toolbar-step-catalog-btn'}
                icon={<CatalogIcon />}
                onClick={toggleCatalog}
              />
            </Tooltip>
          </ToolbarItem>

          {/* CODE TOGGLE BUTTON */}
          <ToolbarItem>
            <Tooltip content={<div>Source Code</div>} position={'bottom'}>
              <Button
                variant={'link'}
                data-testid={'toolbar-show-code-btn'}
                onClick={toggleCodeEditor}
                icon={<CodeIcon />}
              />
            </Tooltip>
          </ToolbarItem>

          <ToolbarItem variant="separator" />

          {/* NAME */}
          <ToolbarItem variant="label">
            {isEditingName ? (
              <InputGroup>
                <TextInput
                  name="edit-integration-name"
                  id="edit-integration-name"
                  data-testid={'kaoto-toolbar--name__edit'}
                  type="text"
                  ref={focusIntegrationInput}
                  onChange={(val) => {
                    // save to local state while typing
                    setLocalName(val);
                    if (isNameValidCheck(val)) {
                      setNameValidation('success');
                    } else {
                      setNameValidation('error');
                    }
                  }}
                  value={localName}
                  aria-label="edit integration name"
                  validated={nameValidation}
                  aria-invalid={nameValidation === 'error'}
                  onKeyUp={(e) => {
                    // allow users to save by pressing enter
                    if (e.key !== 'Enter') return;
                    if (isNameValidCheck(localName)) {
                      setIsEditingName(false);
                      // only issue change if different from current settings
                      if (localName !== settings.name) {
                        setSettings({ ...settings, name: localName });
                      }
                    }
                  }}
                />
                <Button
                  variant="plain"
                  aria-label="save button for editing integration name"
                  onClick={() => {
                    if (isNameValidCheck(localName)) {
                      setIsEditingName(false);
                      // only issue change if different from current settings
                      if (localName !== settings.name) {
                        setSettings({ ...settings, name: localName });
                      }
                    }
                  }}
                  data-testid={'kaoto-toolbar--name__edit--save'}
                  aria-disabled={nameValidation === 'error'}
                  isDisabled={nameValidation === 'error'}
                >
                  <CheckIcon />
                </Button>
                <Button
                  variant="plain"
                  aria-label="close button for editing integration name"
                  data-testid={'kaoto-toolbar--name__edit--close'}
                  onClick={() => {
                    setLocalName(settings.name);
                    setNameValidation('default');
                    setIsEditingName(false);
                  }}
                >
                  <TimesIcon />
                </Button>
              </InputGroup>
            ) : (
              <>
                <span data-testid={'kaoto-toolbar--name'}>{settings.name}</span>&nbsp;&nbsp;
                <Button
                  variant={'link'}
                  data-testid={'kaoto-toolbar--name__edit--start'}
                  onClick={() => {
                    setIsEditingName(true);
                  }}
                >
                  <PencilAltIcon />
                </Button>
              </>
            )}
          </ToolbarItem>

          {/* DEPLOYMENT STATUS */}
          {deployment.crd ? (
            <ToolbarItem alignment={{ default: 'alignRight' }}>
              <div className="status-container" data-testid={'toolbar-deployment-status'}>
                <div className={`dot`}></div>
                <div className="text">Running</div>
              </div>
            </ToolbarItem>
          ) : (
            <ToolbarItem alignment={{ default: 'alignRight' }}></ToolbarItem>
          )}

          {deployment.crd && <ToolbarItem variant="separator" />}

          {/* DEPLOY BUTTON */}
          <ToolbarItem>
            <Tooltip content={<div>Deploy</div>} position={'bottom'}>
              {deployable && (
                <Button
                  tabIndex={0}
                  variant="primary"
                  data-testid={'toolbar-deploy-start-btn'}
                  onClick={handleDeployStartClick}
                >
                  Deploy
                </Button>
              )}
            </Tooltip>
          </ToolbarItem>

          {/* KEBAB DROPDOWN MENU */}
          <ToolbarItem variant="overflow-menu">
            <OverflowMenu breakpoint="2xl">
              <OverflowMenuControl hasAdditionalOptions>
                <Dropdown
                  position={DropdownPosition.right}
                  toggle={<KebabToggle onToggle={(val) => setKebabIsOpen(val)} />}
                  isOpen={kebabIsOpen}
                  isPlain
                  data-testid={'toolbar-kebab-dropdown-btn'}
                  dropdownItems={kebabItems}
                />
              </OverflowMenuControl>
            </OverflowMenu>
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>

      <ConfirmationModal
        handleCancel={() => {
          setIsConfirmationModalOpen(false);
        }}
        handleConfirm={() => {
          deleteIntegration();
          setSourceCode('');
          setSettings({ dsl: settings.dsl, name: 'integration', namespace: 'default' });
          setIsConfirmationModalOpen(false);
        }}
        isModalOpen={isConfirmationModalOpen}
        modalBody={
          'This will clear the whole canvas and settings, and you will lose your current work. Are you sure you would' +
          ' like to proceed?'
        }
      />

      <DeploymentsModal
        handleCloseModal={() => {
          setExpanded({ ...expanded, deploymentsModal: !expanded.deploymentsModal });
        }}
        isModalOpen={expanded.deploymentsModal ?? false}
      />

      <SettingsModal
        handleCloseModal={() => {
          setExpanded({ ...expanded, settingsModal: !expanded.settingsModal });
        }}
        isModalOpen={expanded.settingsModal ?? false}
      />

      <AppearanceModal
        handleCloseModal={() => {
          {
            setExpanded({ ...expanded, appearanceModal: !expanded.appearanceModal });
          }
        }}
        isModalOpen={expanded.appearanceModal ?? false}
      />
    </>
  );
};

export default KaotoToolbar;
