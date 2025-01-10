export type PyProjectTomlOptions = {
  /**
   * Name of the python package as used in imports and filenames.
   * Must only consist of alphanumeric characters and underscores.
   * @required
   */
  readonly packageName: string;
  /**
   * Author's name
   * @required
   */
  readonly authorName: string;
  /**
   * Author's e-mail
   * @required
   */
  readonly authorEmail: string;
  /**
   * Version of the package.
   * @required
   */
  readonly version: string;
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
   * License of this package as an SPDX identifier.
   */
  readonly license?: string;
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

  /**
   * List of runtime dependencies for this project.
   *
   * Dependencies use the format: `<module>@<semver>`
   *
   * Additional dependencies can be added via `project.addDependency()`.
   *
   * @default []
   * @featured
   */
  readonly deps?: string[];
  /**
   * List of dev dependencies for this project.
   *
   * Dependencies use the format: `<module>@<semver>`
   *
   * Additional dependencies can be added via `project.addDevDependency()`.
   *
   * @default []
   * @featured
   */
  readonly devDeps?: string[];
};
