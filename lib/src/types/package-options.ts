export interface PyProjectTomlOptions {
  /**
   * Name of the python package. E.g. "my_python_package".
   * Must only consist of alphanumeric characters and underscores.
   * @default Name of the directory
   */
  readonly packageName?: string;
  /**
   * Author's name
   */
  readonly authorName?: string;
  /**
   * Author's e-mail
   */
  readonly authorEmail?: string;
  /**
   * Version of the package.
   */
  readonly version?: string;
  /**
   * Keywords to add to the package.
   */
  readonly keywords?: string[];
  /**
   * List of maintainers of the package.
   */
  // readonly maintainers?: { name: string; email: string }[];
  /**
   * List of dependencies for this project.
   */
  readonly dependencies?: string[];
  /**
   * List of dev dependencies for this project.
   */
  readonly devDependencies?: string[];
  /**
   * A short description of the package.
   */
  readonly description?: string;
  /**
   * A URL to the website of the project.
   */
  readonly homepage?: string;
  /**
   * README file.
   */
  readonly readme?: string;
  /**
   * License file
   */
  readonly licenseFile?: string;
  /**
   * Python version required to run this package
   */
  readonly requiresPython?: string;
  /**
   * A list of PyPI trove classifiers that describe the project.
   *
   * @see https://pypi.org/classifiers/
   */
  readonly classifiers?: string[];
}
