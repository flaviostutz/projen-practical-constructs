export interface BasePublishOptions {
  /**
   * Sets the registry url to publish to.
   */
  registryUrl?: string;
  /**
   * If defined, will suffix the task name by this name so that multiple
   * publish tasks with different configurations can be defined in the same project.
   * If not defined, the task name will be "publish-python".
   * @default ''
   */
  group?: string;
}
