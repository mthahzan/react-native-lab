import fs from "fs";
import ora from "ora";
import path from "path";
import { execSync } from "child_process";

import Scripts from "./scripts";
import checkCommand from "./helpers/check-cmd";
import { blue, green, red, yellow } from "picocolors";

/** Function to install Chocolatey */
export async function installChocolatey() {
  const spinner = ora({ text: blue("Installing Chocolatey...") }).start();
  try {
    // Check if Chocolatey is already installed
    if (checkCommand("choco")) {
      spinner.succeed(green("Chocolatey is already installed."));
      return;
    }
    spinner.info(yellow("Running Chocolatey installation as non-admin..."));
    // Execute the PowerShell script for non-admin installation
    execSync(
      `powershell.exe -ExecutionPolicy Bypass -File "${Scripts.INSTALL_CHOCOLATELY_AS_NON_ADMIN}"`,
      { stdio: "inherit" }
    );
    spinner.succeed(green("Chocolatey installed successfully (non-admin)."));
    // Add Chocolatey to the current session's PATH
    const chocoPath = `${process.env.ProgramData}\\chocoportable\\bin`;
    process.env.PATH = `${process.env.PATH};${chocoPath}`;
  } catch (error) {
    spinner.fail(red("Failed to install Chocolatey."));
    console.error(error);
    throw error;
  }
}

/** Function to install JDK */
export async function installJDK() {
  const spinner = ora({
    text: blue("Checking for JDK installation..."),
  }).start();
  spinner.stop();
  if (process.platform === "win32") {
    if (!checkCommand("choco")) {
      await installChocolatey();
    }
    try {
      execSync("choco install microsoft-openjdk17", { stdio: "inherit" });
      spinner.succeed(green("OpenJDK installed successfully."));
    } catch (error) {
      spinner.fail(red("Failed to install OpenJDK."));
      throw error;
    }

    // Set JAVA_HOME environment variable
    const javaHomePath = execSync("echo %JAVA_HOME%").toString().trim();
    if (!javaHomePath) {
      const javaPath = execSync("where java").toString().split("\r\n")[0];
      const javaHome = path.dirname(path.dirname(javaPath));
      try {
        execSync(`setx JAVA_HOME "${javaHome}" /M`, { stdio: "inherit" });
        execSync(`setx PATH "%PATH%;${javaHome}\\bin" /M`, {
          stdio: "inherit",
        });
        spinner.succeed(
          green("JAVA_HOME environment variable set successfully.")
        );
      } catch (error) {
        spinner.fail(red("Failed to set JAVA_HOME environment variable."));
        throw error;
      }
    }
  } else {
    spinner.fail(
      red("Please install OpenJDK manually on non-Windows systems.")
    );
  }
}

/** Function to install Android Studio */
export async function installAndroidStudio() {
  const spinner = ora({
    text: blue("Checking for Android Studio installation..."),
  }).start();
  spinner.stop();

  if (!checkCommand("choco")) {
    await installChocolatey();
  }
  const androidStudioPath = path.join(
    process.env.ProgramFiles || "C:\\Program Files",
    "Android",
    "Android Studio",
    "bin",
    "studio.exe"
  );

  if (process.platform === "win32") {
    if (!fs.existsSync(androidStudioPath)) {
      spinner.text = yellow("Installing Android Studio...");
      spinner.start();
      try {
        // Path to your PowerShell script
        execSync(
          `powershell -ExecutionPolicy Bypass -File "${Scripts.INSTALL_ANDROID_STUDIO}"`,
          { stdio: "inherit" }
        );
        spinner.succeed(green("Android Studio installed successfully."));
      } catch (error) {
        spinner.fail(red("Failed to install Android Studio."));
        console.error(error);
        throw error;
      }
    } else {
      spinner.succeed(green("Android Studio is already installed."));
    }

    const pathSpinner = ora({
      text: blue("Adding Android Studio to PATH..."),
    }).start();
    pathSpinner.stop();

    // Set ANDROID_HOME environment variable
    const androidHomePath = path.join(
      process.env.ProgramFiles || "C:\\Program Files",
      "Android",
      "Sdk"
    );

    if (!fs.existsSync(androidHomePath)) {
      pathSpinner.fail(
        red("Android SDK not found. Please install Android Studio.")
      );
      return;
    }

    try {
      execSync(`setx ANDROID_HOME "${androidHomePath}" /M`, {
        stdio: "inherit",
      });
      execSync(`setx ANDROID_SDK_ROOT "${androidHomePath}" /M`, {
        stdio: "inherit",
      });

      execSync(
        `setx PATH "%PATH%;${androidHomePath}\\tools;${androidHomePath}\\platform-tools" /M`,
        { stdio: "inherit" }
      );

      pathSpinner.succeed(green("Android Studio added to PATH successfully."));
    } catch (error) {
      pathSpinner.fail(
        red(
          "Failed to set ANDROID_HOME and ANDROID_SDK_ROOT environment variables."
        )
      );
      console.error(error);
      throw error;
    }
  } else {
    spinner.fail(
      red("Please install Android Studio manually on non-Windows systems.")
    );
  }
}