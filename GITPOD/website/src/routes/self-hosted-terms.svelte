<script context="module">
  export const prerender = true;
</script>

<script>
  import OpenGraph from "../components/open-graph.svelte";
</script>

<style>
  ol li::marker {
    content: counters(list-item, ".") ". ";
  }
</style>

<OpenGraph
  data={{
    description: "Gitpod Self-Hosted terms of service.",
    title: "Self-Hosted Terms",
  }}
/>
<article class="text-blob">
  <h1>
    Gitpod Self-Hosted Free License Terms and Gitpod Enterprise Source Code
    License
  </h1>
  <ol class="toc" type="1">
    <li>
      <h2>Preamble</h2>
      <ol type="1">
        <li>
          These Software Licensing Terms (“Terms”) provide the terms and
          conditions that govern usage of the Software Gitpod Self-Hosted Free
          Edition in source and binary form (“Software”). The Software is
          provided by Gitpod GmbH, Am Germaniahafen 1, 24143 Kiel (“Gitpod”). By
          downloading or using to the Software, you agree to be bound by the
          following Terms.
        </li>
      </ol>
    </li>
    <li>
      <h2>Scope of Terms</h2>
      <ol>
        <li>
          These Terms apply to the usage of the Software, which is designed to
          be used for business purposes.
        </li>
        <li>
          These Terms apply to the binary code and to the source code of the
          Software, unless the header of a source file explicitly refers to a
          different license.
        </li>
        <li>
          These Terms apply unless you have a separate agreement with Gitpod in
          written form that explicitly supersedes these Terms.
        </li>
      </ol>
    </li>
    <li>
      <h2>License Fees</h2>
      <ol>
        <li>
          The use of the Software as described in Sec. 2 is free of charge. It
          is however limited to the features that are accessible without a
          license key and may only take place in accordance with these Terms.
        </li>
        <li>
          In case you want to use additional features or distribute the Software
          or modifications to it without the restrictions of these Terms, please
          reach out for a license key, which is subject to different legal and
          commercial terms.
        </li>
      </ol>
    </li>
    <li>
      <h2>Granting of Rights</h2>
      <ol>
        <li>
          Permission is hereby granted to obtain a copy of the Software and
          their accompanying documentation to use, reproduce and execute the
          Software for internal purposes in accordance with these Terms and to
          distribute the unmodified software without charging a fee for it.
        </li>
        <li>
          Subject to the conditions of these Terms, you may modify the Software,
          including patching it. You agree that Gitpod retains all right, title
          and interest in and to all such modifications and patches
          (“Modifications”). You may only use, reproduce and execute the
          Modifications for internal purposes in accordance with these Terms.
          You may not distribute Modifications to any third party. Nonetheless,
          you may make such modifications publicly available as fork of the
          repository which hosts the original version of the Software, however
          only under these Terms and only, if accompanied by the complete
          machine-readable source code of the Modifications and of the Software.
        </li>
        <li>
          The copyright notices in the Software and this entire statement,
          including the above license grant and these Terms must be included in
          all copies of the Software (in whole or in part). Copyright notices,
          serial numbers and other features aimed at product identification or
          control may not be removed, altered, suppressed or otherwise bypassed
          under any circumstances. For the avoidance of doubt, the software may
          neither in source nor in binary form be modified in order to enable or
          activate any features of the software that would otherwise require a
          valid license key.
        </li>
        <li>
          Any other usage of the Software, in particular modifying, combining it
          with other software and providing it to third parties on a commercial
          basis, is prohibited. This includes any sale, lease, indirect use of
          the Software to the benefit of third parties and its provision as a
          commercial service, or offering it as a part of a commercial service
          or platform.
        </li>
        <li>
          The Software remains the exclusive intellectual property of Gitpod at
          all times. Mandatory rights resulting from applicable copyright law
          (e.g. related to decompilation) remain unaffected.
        </li>
        <li>
          Gitpod provides the source code of the Software on a voluntary basis
          and is not obligated to do so. Furthermore, Gitpod is not obligated to
          provide any updates or upgrades it may develop.
        </li>
        <li>
          Please consider purchasing a license key (see above Sec. 3) for
          further usage rights and additional features.
        </li>
      </ol>
    </li>
    <li>
      <h2>Telemetry</h2>
      <ol>
        <li>
          Gitpod intends to collect certain statistical data on the use of the
          Software on an anonymized basis in the future with a future version of
          the Software. The data will only be used to improve the Software and
          the data will not be sold to third parties. Gitpod will inform about
          this with the future release.
        </li>
      </ol>
    </li>
    <li>
      <h2>Warranty and Liability</h2>
      <ol>
        <li>
          THE SOFTWARE IS PROVIDED FREE OF CHARGE ON AN “AS IS” BASIS, WITHOUT
          WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
          THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
          TITLE AND NON-INFRINGEMENT.
        </li>
        <li>
          IN NO EVENT SHALL THE COPYRIGHT HOLDERS OR ANYONE DISTRIBUTING THE
          SOFTWARE BE LIABLE FOR ANY DAMAGES OR OTHER LIABILITY, WHETHER IN
          CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
          WITH THE SOFTWARE OR THE USE OF OR OTHER DEALINGS IN THE SOFTWARE.
        </li>
        <li>
          THIS LIMITATION OF LIABILITY DOES NOT EXCLUDE MANDATORY LEGAL GROUNDS
          FOR LIABILITY SUCH AS LIABILITY FOR PERSONAL INJURY, GROSS NEGLIGENCE,
          WILLFUL INTENT OR LAWS ON PRODUCT LIABILITY.
        </li>
      </ol>
    </li>
    <li>
      <h2>Third-party Components</h2>
      <ol>
        <li>
          The Software contains third-party components including open source
          software (“Third-Party Components“). Parts of such Third-Party
          Components are subject to deviating license terms (“Third-Party
          License Terms“). A list of such Third-Party Components and its
          respective Third-Party License Terms are available via the files
          License.third-party.npm.txt and License.third-party.go.txt. No
          stipulation in these Terms is intended to impose further restrictions
          on your use of such Third-Party Components licensed under Third-Party
          License Terms.
        </li>
        <li>
          Gitpod reserves the right to introduce deviating or additional
          Third-Party License Terms in the course of modifications of the
          Software and in case of updates for the Software to the extent
          necessary due to additional Third-Party Components or due to changed
          Third-Party License Terms.
        </li>
      </ol>
    </li>
  </ol>
</article>
