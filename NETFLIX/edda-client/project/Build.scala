import sbt._
import sbt.Keys._

object MainBuild extends Build {

  lazy val baseSettings =
    sbtrelease.ReleasePlugin.releaseSettings ++
    GitVersion.settings ++
    Bintray.settings ++
    net.virtualvoid.sbt.graph.Plugin.graphSettings ++
    scoverage.ScoverageSbtPlugin.projectSettings

  lazy val buildSettings = baseSettings ++ Seq(
            organization := BuildSettings.organization,
            scalaVersion := Dependencies.Versions.scala,
           scalacOptions ++= BuildSettings.compilerFlags,
            javacOptions ++= BuildSettings.javaCompilerFlags,
     javacOptions in doc := BuildSettings.javadocFlags,
              crossPaths := false,
           sourcesInBase := false,
            fork in Test := true,
        autoScalaLibrary := false,
       externalResolvers := BuildSettings.resolvers,
     checkLicenseHeaders := License.checkLicenseHeaders(streams.value.log, sourceDirectory.value),
    formatLicenseHeaders := License.formatLicenseHeaders(streams.value.log, sourceDirectory.value)
  )

  lazy val root = project.in(file("."))
    .aggregate(
      `edda-client`,
      `edda-client-module`
    )
    .settings(buildSettings: _*)
    .settings(BuildSettings.noPackaging: _*)

  lazy val `edda-client` = project
    .settings(buildSettings: _*)
    .settings(libraryDependencies ++= commonDeps)
    .settings(libraryDependencies ++= Seq(
      Dependencies.awsObjectMapper,
      Dependencies.iepConfig,
      Dependencies.iepNflxEnv,
      Dependencies.iepRxHttp
    ))

  lazy val `edda-client-module` = project
    .dependsOn(`edda-client`)
    .settings(buildSettings: _*)
    .settings(libraryDependencies ++= commonDeps)
    .settings(libraryDependencies ++= Seq(
      Dependencies.iepModRxNetty,
      Dependencies.iepModEureka % "test",
      Dependencies.iepEurekaCfg % "test",
      Dependencies.spectatorNflx % "test"
    ))

  lazy val commonDeps = Seq(
    Dependencies.junitInterface % "test",
    Dependencies.scalatest % "test"
  )

  lazy val checkLicenseHeaders = taskKey[Unit]("Check the license headers for all source files.")
  lazy val formatLicenseHeaders = taskKey[Unit]("Fix the license headers for all source files.")
}
