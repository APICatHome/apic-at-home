/* APIC at Home — forum data. One thread per imported lab document.
   Content distilled from real APIC / DataPower lab write-ups. Attaches to window.FORUM_DATA */
(function () {
  const CATEGORIES = [
    { id: "labs",    name: "Lab Modules",        blurb: "Self-contained, repeatable hands-on modules.",     icon: "beaker",   accent: "cyan",   threads: 8 },
    { id: "qa",      name: "Discussion / Q&A",   blurb: "Ask, answer, and trade patterns.",                  icon: "chat",     accent: "blue",   threads: 2 },
    { id: "install", name: "Install & Upgrade",  blurb: "Standing up and moving between versions.",          icon: "download", accent: "violet", threads: 8 },
    { id: "trouble", name: "Troubleshooting",    blurb: "When the gateway won't peer and the pods won't start.", icon: "wrench", accent: "amber", threads: 6 },
    { id: "cicd",    name: "CI/CD Integration",  blurb: "Pipelines, GitOps, and config replication.",        icon: "branch",   accent: "green",  threads: 2 },
  ];

  // All authors are Luca Cappelletti (single real author). Colors kept varied for avatar tone.
  const M = {
    luke:    { name: "Luca Cappelletti", handle: "luke", color: "#22d3ee", role: "Lab Author" },
    priya:   { name: "Luca Cappelletti", handle: "luke", color: "#a78bfa", role: "Maintainer" },
    matt:    { name: "Luca Cappelletti", handle: "luke", color: "#f59e0b", role: "Maintainer" },
    wenqian: { name: "Luca Cappelletti", handle: "luke", color: "#ec4899", role: "Lab Author" },
    rina:    { name: "Luca Cappelletti", handle: "luke", color: "#34d399", role: "Member" },
    devon:   { name: "Luca Cappelletti", handle: "luke", color: "#8b5cf6", role: "Member" },
    sasha:   { name: "Luca Cappelletti", handle: "luke", color: "#3b82f6", role: "Member" },
    omar:    { name: "Luca Cappelletti", handle: "luke", color: "#06b6d4", role: "Member" },
    marco:   { name: "Luca Cappelletti", handle: "luke", color: "#10b981", role: "Member" },
  };

  const c = (lang, body) => ({ type: "code", lang, body });
  const p = (body) => ({ type: "p", body });

  const THREADS = [
    /* ── LAB-01 ─────────────────────────────────────────────────────────── */
    {
      id: "lab-01", cat: "labs", module: "LAB-01", level: "Intermediate", minutes: 90,
      title: "Home lab foundation: ESXi 8.0 + MikroTik CHR + an APIC IP plan that survives reboots",
      author: M.luke, created: "2026-04-08T09:00:00Z", lastAt: "2026-05-30T12:10:00Z",
      tags: ["esxi", "mikrotik", "homelab", "networking", "nip.io"],
      replies: 24, views: 5120, solved: true, pinned: true,
      posts: [
        { author: M.luke, at: "2026-04-08T09:00:00Z", body: [
          p("This is the base layer for every other lab in the series: a Dell PowerEdge R820 running ESXi 8.0U3e, a MikroTik CHR doing NAT/DHCP/DNS for an isolated 10.0.0.0/24 lab network, and a fixed IP plan so APIC's certificates never break on a reboot."),
          p("The R820's Xeon E5-4600 v2 CPUs are not on the ESXi 8 HCL, so the installer PSODs unless you pass allowLegacyCPU. Set it at the boot prompt with [Tab] (not Shift+O — that's ESXi 7), then make it permanent in boot.cfg before the first reboot:"),
          c("bash", "# at the ESXi 8 installer boot line, press [Tab] and append:\n#   > mboot.c32 -c boot.cfg allowLegacyCPU=true\n\n# make it permanent (esxcfg-advcfg does NOT work on 8.0):\nsed -i 's/kernelopt=autoPartition=FALSE/kernelopt=allowLegacyCPU=true autoPartition=FALSE/' /bootbank/boot.cfg\ncat /bootbank/boot.cfg | grep kernelopt"),
          p("The MikroTik CHR is the lab router: ether1 is the WAN (home LAN), ether2 is the isolated lab. After a RouterOS major upgrade it can lose the DHCP client on ether1 and start handing out 10.0.0.x on the WAN — pin a static IP on ether1 to avoid it:"),
          c("routeros", "/ip address add address=10.0.0.1/24 interface=ether2\n/ip firewall nat add chain=srcnat out-interface=ether1 action=masquerade\n/ip dns set servers=8.8.8.8,1.1.1.1 allow-remote-requests=yes\n/ip pool add name=lab-pool ranges=10.0.0.200-10.0.0.249\n/ip dhcp-server add name=lab-dhcp interface=ether2 address-pool=lab-pool disabled=no"),
          p("IP plan for 10.0.0.0/24: .1 router, .10-.49 jumpboxes/utility, .50-.59 single-node APIC, .60-.99 3-node APIC, .140-.179 K8s/OCP, .200-.249 DHCP + DataPower quorum tests. APIC needs resolvable FQDNs — nip.io (e.g. ip-10-0-0-50.nip.io) gives you wildcard DNS with zero infrastructure, as long as the IPs are static."),
        ]},
        { author: M.sasha, at: "2026-04-10T15:30:00Z", body: [ p("The allowLegacyCPU-in-boot.cfg step saved my R720 — same procedure, 2 sockets instead of 4. Confirmed it survives a cold boot now.") ]},
        { author: M.luke, at: "2026-04-10T16:05:00Z", solution: true, body: [
          p("Exactly — R720 and R820 are identical here. One more reboot-safety rule for APIC specifically: never 'Upgrade VM Compatibility' on the APIC OVAs. The disk-encryption keys are bound to the VM UUID + hardware version; bump the vHW and the node won't boot. Always choose 'I moved it', never 'I copied it', when re-registering."),
        ]},
      ],
    },

    /* ── LAB-02 ─────────────────────────────────────────────────────────── */
    {
      id: "lab-02", cat: "install", module: "LAB-02", level: "Beginner", minutes: 45,
      title: "Run IBM DataPower Gateway in Docker on WSL2 (no Docker Desktop)",
      author: M.luke, created: "2026-04-15T10:20:00Z", lastAt: "2026-05-28T08:40:00Z",
      tags: ["datapower", "docker", "wsl2", "windows", "developers-limited"],
      replies: 19, views: 4310, solved: true,
      posts: [
        { author: M.luke, at: "2026-04-15T10:20:00Z", body: [
          p("The lightest way to get a real DataPower to practise on: the developers-limited image in a Docker container running on Docker Engine inside WSL2 — no Docker Desktop licence required. Enable WSL2, install Docker Engine in Ubuntu, then pull from either the entitled or the open registry."),
          c("bash", "# open registry — often no login needed:\nskopeo list-tags docker://icr.io/cpopen/datapower/datapower-limited\ndocker pull icr.io/cpopen/datapower/datapower-limited:10.6.0.4\n\n# entitled registry (needs IBM ID + API key):\ndocker login cp.icr.io\ndocker pull cp.icr.io/cp/ibm-datapower-gateway/datapower:10.6.0.5-developers-limited"),
          p("Run it with persistent config/local/cert volumes and peering disabled for a single instance. Map 9090 (WebGUI), 9022→22 (SSH), 5550 (XML mgmt), 5554 (REST mgmt):"),
          c("bash", "mkdir -p ~/datapower/config ~/datapower/local ~/datapower/cert\ndocker run -it --name idg \\\n  -v ~/datapower/config:/opt/ibm/datapower/drouter/config \\\n  -v ~/datapower/local:/opt/ibm/datapower/drouter/local \\\n  -v ~/datapower/cert:/opt/ibm/datapower/drouter/cert \\\n  -e DATAPOWER_ACCEPT_LICENSE=true \\\n  -e DATAPOWER_GATEWAY_PEERING_MODE=disabled \\\n  -p 9090:9090 -p 9022:22 -p 5550:5550 -p 5554:5554 \\\n  icr.io/cpopen/datapower/datapower-limited:10.6.0.4"),
          p("Gotcha: on recent images the WebGUI ships disabled. If https://localhost:9090 won't load, enable web-mgmt from the CLI and save, then restart the container:"),
          c("text", "idg# co\nidg(config)# web-mgmt\nidg(config web-mgmt)# admin-state enabled\nidg(config web-mgmt)# exit\nidg(config)# write mem"),
        ]},
        { author: M.devon, at: "2026-04-18T11:10:00Z", body: [ p("Hit the 'ERROR_SHARING_VIOLATION' on the ext4.vhdx after a crash. For anyone else: it's almost always antivirus locking the file — exclude the WSL folder, or if you ran 'wsl --mount --vhd' by mistake, release it with 'wsl --unmount \\\\?\\D:\\WSL\\Ubuntu\\ext4.vhdx'.") ]},
        { author: M.luke, at: "2026-04-18T12:00:00Z", solution: true, body: [ p("Right. And the 'gateway-peering(default-gateway-peering): Configuration is not valid' noise in the logs is harmless on a single instance — that's why we start with DATAPOWER_GATEWAY_PEERING_MODE=disabled. Core gateway/transform/security functions are unaffected.") ]},
      ],
    },

    /* ── LAB-03 ─────────────────────────────────────────────────────────── */
    {
      id: "lab-03", cat: "install", module: "LAB-03", level: "Advanced", minutes: 120,
      title: "Air-gapped install: mirror APIC v10 to a private registry and deploy on OpenShift via a bastion",
      author: M.priya, created: "2026-05-06T13:00:00Z", lastAt: "2026-06-02T09:25:00Z",
      tags: ["openshift", "air-gapped", "oc-mirror", "ibm-pak", "bastion", "cert-manager"],
      replies: 16, views: 2980, solved: true, pinned: true,
      posts: [
        { author: M.priya, at: "2026-05-06T13:00:00Z", body: [
          p("Full disconnected install of API Connect on OCP. On the mirror host you use the ibm-pak plugin to pull the CASE files and mirror every image to your private registry; on the bastion you point the cluster at that registry and apply the subsystem CRs. This is the procedure that mirrors a customer's locked-down environment."),
          c("bash", "# on the mirror host\nexport CASE_NAME=ibm-apiconnect CASE_VERSION=5.11.0\nexport CS_CASE_NAME=ibm-cp-common-services\noc ibm-pak get $CASE_NAME --version $CASE_VERSION\noc ibm-pak generate mirror-manifests $CASE_NAME --version $CASE_VERSION $TARGET_REGISTRY\npodman login cp.icr.io          # user: cp / pass: entitlement key\noc image mirror -f ~/.ibm-pak/data/mirror/$CASE_NAME/$CASE_VERSION/images-mapping.txt \\\n  -a $REGISTRY_AUTH_FILE --filter-by-os '.*' --skip-multiple-scopes --max-per-registry=1"),
          p("On the bastion, tell the cluster to pull from the mirror (ImageDigestMirrorSet), apply the catalog sources, then install cert-manager for OpenShift before any subsystem. Each subsystem goes in its own namespace (mgmt / ptl / a7s):"),
          c("bash", "oc apply -f image-digest-mirror-set.yaml\noc apply -f catalog-sources.yaml\noc get catalogsource -n openshift-marketplace\noc apply -f apic-sub.yaml      # channel v5.11-sc2, source ibm-apiconnect-catalog"),
          p("Install order is Management → Portal → Analytics. After management is up, export its ingress-ca secret and apply it into the ptl and a7s namespaces so the subsystems trust each other. A subsystem is done when READY=True and the summary shows all services online, e.g. management 16/16."),
          c("bash", "oc -n mgmt get secret ingress-ca -o yaml > ingress-ca.yaml   # strip namespace/uid/resourceVersion\noc apply -f ingress-ca.yaml -n ptl\noc get ManagementCluster -n mgmt"),
        ]},
        { author: M.priya, at: "2026-05-07T10:15:00Z", solution: true, body: [
          p("Also covered in this module: the v10→v10 different-form-factor migration (OVA → OCP). You run save_v10_source_configuration.py on the source, then restore_management_db.py / register_gateway_portals_in_target.py / restore_portal_db.py on the target, and finally cut over the live DataPower gateway clusters by de-registering them from the old Cloud Manager and registering them in the new one — DR cluster first, sanity-check, then DC."),
        ]},
      ],
    },

    /* ── LAB-04 ─────────────────────────────────────────────────────────── */
    {
      id: "lab-04", cat: "install", module: "LAB-04", level: "Advanced", minutes: 60,
      title: "2DCDR Lab — deploy the DC1 Management subsystem (n3 OVA on ESXi)",
      author: M.luke, created: "2026-04-20T09:30:00Z", lastAt: "2026-05-31T14:05:00Z",
      tags: ["apic-v10", "ova", "2dcdr", "management", "apicup"],
      replies: 22, views: 3640, solved: true,
      posts: [
        { author: M.luke, at: "2026-04-20T09:30:00Z", body: [
          p("First subsystem of the 2-Data-Center DR build: a 3-node Management cluster on 10.0.8.8, profile n3xc4.m16, deployed from OVAs. You generate the ISOs with apicup first (the VMs don't need to exist yet), deploy the OVAs, mount one ISO per node, then power on."),
          c("bash", "apicup subsys install mgmt --out mgmtplan-out   # 3 ISOs, one per node\n# deploy 3 OVAs, upload ISOs to the datastore, mount one per VM,\n# tick 'Connect At Power On', then:\napicup subsys install mgmt --no-verify"),
          p("Three real gotchas, all solved in this module. (1) mkisofs 'cannot run executable found relative to current directory' — add the project folder to PATH. (2) On a fresh n3 the ManagementCluster CR doesn't exist yet, so the HA health check fails; --skip-health-check does NOT bypass it, but --no-verify does. (3) v10.0.8.x wants a 6-field cron (with seconds) for the backup schedule:"),
          c("bash", "setx PATH \"%PATH%;D:\\APIC_CODE\\10.0.8.8\\DC1\\my-apic-project-10088-dc1\"\napicup subsys set mgmt database-backup-schedule \"0 0 0 * * *\"   # sec min hr day mon wday"),
          p("Verify against the live endpoint, not just apic status — if the cert CN is 'Kubernetes Ingress Controller Fake Certificate' the install didn't finish:"),
          c("bash", "echo | openssl s_client -connect api.ip-192.168.1.205.nip.io:443 \\\n  -servername api.ip-192.168.1.205.nip.io 2>/dev/null | \\\n  openssl x509 -noout -text | grep -A3 'Subject:'"),
        ]},
        { author: M.luke, at: "2026-04-20T09:40:00Z", solution: true, body: [
          p("Two more that bite everyone: SSH key auth works out of the box but the ESXi console password is unset — 'ssh -i id_rsa_apic apicadm@<ip>' then 'sudo passwd apicadm' on each node. And the S3 backup webhook validation blocks the install if MinIO TLS isn't perfect, so for the first pass set database-backup-protocol to local and wire up S3 later (LAB-16)."),
        ]},
      ],
    },

    /* ── LAB-05 ─────────────────────────────────────────────────────────── */
    {
      id: "lab-05", cat: "install", module: "LAB-05", level: "Intermediate", minutes: 45,
      title: "Deploy the Analytics subsystem (DC1, n3) and register it in Cloud Manager",
      author: M.luke, created: "2026-04-22T11:00:00Z", lastAt: "2026-05-20T17:30:00Z",
      tags: ["analytics", "apic-v10", "ova", "apicup", "nip.io"],
      replies: 11, views: 1870, solved: false,
      posts: [
        { author: M.luke, at: "2026-04-22T11:00:00Z", body: [
          p("Analytics doesn't exist in the apicup project by default — you create it, then set the ingestion endpoint to the first analytics node (or a load balancer; in a lab without one, just use node 1). Minimum n3 profile on 10.0.8.8 is n3xc4.m16; the old n3xc2.m16 is gone."),
          c("bash", "apicup subsys create analytics analytics\napicup subsys set analytics deployment-profile n3xc4.m16\napicup subsys set analytics analytics-ingestion ip-192-168-1-208.nip.io\napicup hosts create analytics ip-192-168-1-208.nip.io U21hcnR3YXkzNTgu\napicup iface create analytics ip-192-168-1-208.nip.io eth0 192.168.1.208/255.255.255.0 192.168.1.1\napicup subsys get analytics --validate"),
          p("Like portal, analytics self-installs from the ISO on first boot, but on a fresh cluster run 'apicup subsys install analytics --no-verify' once. Done = Install stage DONE / CR Status Running on all 3 nodes. Then register it in Cloud Manager under Topology → Register Service → Analytics, pointing at the ingestion endpoint."),
          p("Note: analytics backup uses a 5-field cron (analytics-backup-*), unlike management's 6-field. We defer backup to the S3 module for the same MinIO TLS reason as management."),
        ]},
      ],
    },

    /* ── LAB-06 ─────────────────────────────────────────────────────────── */
    {
      id: "lab-06", cat: "install", module: "LAB-06", level: "Intermediate", minutes: 45,
      title: "Deploy the Developer Portal subsystem (DC1, 2DCDR active)",
      author: M.luke, created: "2026-04-24T10:00:00Z", lastAt: "2026-05-22T13:15:00Z",
      tags: ["portal", "apic-v10", "2dcdr", "replication", "ova"],
      replies: 13, views: 2110, solved: true,
      posts: [
        { author: M.luke, at: "2026-04-24T10:00:00Z", body: [
          p("Portal on n3xc4.m8. The portal-admin and portal-www endpoints are GLOBAL — identical on both DCs — while portal-replication is DC-specific and replication-peer-fqdn points at the other DC's replication endpoint. When several subsystems share one project directory you must also link the portal to the management certs explicitly."),
          c("bash", "apicup subsys create portal portal\napicup subsys set portal multi-site-ha-enabled true\napicup subsys set portal multi-site-ha-mode active\napicup subsys set portal portal-replication portal-replication.ip-192-168-1-211.nip.io\napicup subsys set portal replication-peer-fqdn portal-replication.ip-192-168-1-220.nip.io\napicup certs set portal mgmt-platform-api platform-api.crt platform-api.key platform-api-ca.crt\napicup certs set portal mgmt-consumer-api consumer-api.crt consumer-api.key consumer-api-ca.crt"),
          p("The portal OVA self-installs from the ISO — no apicup install step needed once it boots. Watch progress as a fraction climbing to 6/6:"),
          c("bash", "sudo apic status | grep -E \"CR Status|CR Condition|Reconciled\"\n# Reconciled Version: 10.0.8.8-4654 / CR Status: Running / CR Condition: 6/6 DeploymentReady"),
        ]},
        { author: M.luke, at: "2026-04-24T10:08:00Z", solution: true, body: [
          p("The only validation error in this build was portal-replication erroring out — fixed by clearing the replication-ingress cert and re-setting the endpoints ('apicup certs set portal portal-replication-ingress --clear'). Wizard offers 'Small 4CPU/16GB'; keep 16GB even though the profile minimum is 8GB — a 3-node cluster is happier with the headroom."),
        ]},
      ],
    },

    /* ── LAB-07 ─────────────────────────────────────────────────────────── */
    {
      id: "lab-07", cat: "install", module: "LAB-07", level: "Advanced", minutes: 90,
      title: "Build the DC2 warm-standby site and wire up 2DCDR replication",
      author: M.luke, created: "2026-04-28T09:15:00Z", lastAt: "2026-06-01T11:40:00Z",
      tags: ["2dcdr", "disaster-recovery", "replication", "calico", "encryption-secret"],
      replies: 18, views: 2530, solved: true,
      posts: [
        { author: M.luke, at: "2026-04-28T09:15:00Z", body: [
          p("DC2 is the passive site. It lives in the SAME apicup project as DC1 (IBM-recommended, for shared cert chains) as separate subsystems mgmt-dc2 / analytics-dc2 / portal-dc2. All management endpoints (platform-api, cloud-admin-ui, …) stay identical to DC1; only site-name, ha-mode and the replication endpoints differ. The management and portal encryption keys must be copied from DC1 or replication silently fails."),
          c("bash", "apicup subsys create mgmt-dc2 management\napicup subsys set mgmt-dc2 site-name dc2\napicup subsys set mgmt-dc2 multi-site-ha-mode passive\napicup subsys set mgmt-dc2 replication-peer-fqdn replication.ip-192.168.1.205.nip.io\napicup certs get mgmt encryption-secret -t key > mgmt-encryption-secret\napicup certs set mgmt-dc2 encryption-secret mgmt-encryption-secret"),
          p("Expect DC2 management to sit at CR Status: Blocked / HA Error until DC1 is reachable — that's correct for passive mode. Start DC1 and it unblocks on its own. After a suspend/resume of the ESXi VMs, Calico can come back 'connection is unauthorized' and break the tunnel; delete the calico-node pods and K8s recreates them with fresh tokens:"),
          c("bash", "export KUBECONFIG=/etc/kubernetes/admin.conf\nsudo -E kubectl delete pod -n kube-system -l k8s-app=calico-node"),
        ]},
        { author: M.luke, at: "2026-04-28T09:25:00Z", solution: true, body: [
          p("Key lessons: analytics does NOT replicate between DCs — each collects from its own gateway. Portal DC2 must NOT be registered in Cloud Manager (same endpoints as DC1 → 'service with same endpoint exists'); replication is handled at the subsystem level and you can see it working when portal-dc1-* pods appear on the DC2 nodes. DC2 has no Cloud Manager UI — admin is always via DC1."),
        ]},
      ],
    },

    /* ── LAB-08 ─────────────────────────────────────────────────────────── */
    {
      id: "lab-08", cat: "install", module: "LAB-08", level: "Advanced", minutes: 75,
      title: "Upgrade the OVA to 10.0.1.9-eus: pgbouncer DNS, zombie webhooks and stale certs",
      author: M.rina, created: "2026-05-02T08:00:00Z", lastAt: "2026-05-29T16:20:00Z",
      tags: ["upgrade", "ova", "pgbouncer", "cert-manager", "webhook", "apicops"],
      replies: 14, views: 1740, solved: true,
      posts: [
        { author: M.rina, at: "2026-05-02T08:00:00Z", body: [
          p("Upgrade path matters: 10.0.1.2-eus and later are supported into 10.0.1.9-eus; 10.0.0.0-ifix2 / 10.0.1.0 / 10.0.1.1-eus are NOT. If your 10.0.1.2 system has the pgbouncer 'server DNS lookup failed' problem, validate it first, then upgrade with the new installer and replace the pgbouncer image."),
          c("bash", "oc logs <pgbouncer-pod> -n <ns> | grep 'server DNS lookup failed'\n# after upgrading, swap the deployment image to the 10.0.1.9 pgbouncer digest and confirm:\nkubectl exec -it <pgbouncer-pod> -n <ns> -- pgbouncer --version   # PgBouncer 1.15.0"),
          p("Three post-upgrade traps. Operator upgrade via OLM can leave a duplicate (zombie) validatingwebhookconfiguration from the old CSV that blocks operand upgrades — delete the old one. Stuck taskmanager tasks ('Stale claimed task set to errored state') 15 min after upgrade → restart the nats cluster pods:"),
          c("bash", "kubectl -n <ns> delete pod management-natscluster-1 management-natscluster-2 management-natscluster-3"),
          p("And TLS / 'Failed to verify first certificate' / 401s between APIM and portal/analytics mean cert-manager refreshed a cert before its CA (a race during the cert-manager v0.10 cleanup). Find stale certs with apicops and delete them so the system regenerates:"),
          c("bash", "apicops upgrade:stale-certs -n <namespace>\nkubectl delete secret <stale-secret>   # delete BOTH server+client of a pair if unsure"),
        ]},
        { author: M.priya, at: "2026-05-03T09:10:00Z", solution: true, body: [ p("apicops upgrade:stale-certs replaced the old verify.sh openssl loop — use it whenever it's available. For server/client cert pairs (portal-admin / portal-admin-client, mgmt-replication / -client) delete both, since the error message won't tell you which half cert-manager missed.") ]},
      ],
    },

    /* ── LAB-09 ─────────────────────────────────────────────────────────── */
    {
      id: "lab-09", cat: "install", module: "LAB-09", level: "Beginner", minutes: 15,
      title: "Fix 'E: Unable to locate package' on Ubuntu (lab prerequisite)",
      author: M.devon, created: "2026-05-10T14:00:00Z", lastAt: "2026-05-18T10:00:00Z",
      tags: ["ubuntu", "apt", "prereq", "linux"],
      replies: 6, views: 920, solved: true,
      posts: [
        { author: M.devon, at: "2026-05-10T14:00:00Z", body: [
          p("Half the install labs start by apt-installing something (skopeo, docker, jq) on Ubuntu and people hit 'E: Unable to locate package'. It almost always means apt's cache is stale or the right repo isn't enabled. The fast checklist:"),
          c("bash", "sudo apt update && sudo apt upgrade -y          # 1. refresh package lists\n# 2. check spelling/case — names are case-sensitive (libjpeg-dev, not LibJpeg-dev)\nsudo add-apt-repository universe                 # 3. enable universe/multiverse/restricted\nlsb_release -a                                  # 4. confirm the pkg exists for your release\nsudo apt clean                                  # 5. clear a corrupt cache"),
          p("If it's still missing, the package may not exist for your Ubuntu version (check on packages.ubuntu.com), the mirror may be flaky (swap the URL in /etc/apt/sources.list), or your release is EOL ('hwe-support-status --verbose'). Work down the list in order."),
        ]},
      ],
    },

    /* ── LAB-10 ─────────────────────────────────────────────────────────── */
    {
      id: "lab-10", cat: "labs", module: "LAB-10", level: "Intermediate", minutes: 40,
      title: "Query gateway peering health over the DataPower REST management interface",
      author: M.luke, created: "2026-05-12T09:00:00Z", lastAt: "2026-06-03T15:00:00Z",
      tags: ["datapower", "rest", "gateway-peering", "jq", "openshift"],
      replies: 12, views: 1980, solved: true,
      posts: [
        { author: M.luke, at: "2026-05-12T09:00:00Z", body: [
          p("DataPower exposes a REST management interface on port 5554. This module uses it to pre-flight a gateway before an OCP node drain — the exact checks that would have caught the Danske incident where stale peering IPs left API collections empty and every call 404'd. jq isn't in the pod, so run curl inside the pod via oc exec and pipe to jq on your laptop."),
          c("bash", "oc exec -n apic gwv6-0 -c datapower -- \\\n  curl -k -s -u \"admin:admin\" \\\n  https://localhost:5554/mgmt/status/apiconnect/GatewayPeeringStatus \\\n  | jq '.GatewayPeeringStatus[] | {Name, Address, LinkStatus, Primary, Priority}'"),
          p("The single most important check: API collections. An empty array here is the direct cause of 'The request URL is not routed to any API collection' 404s:"),
          c("bash", "oc exec -n apic gwv6-0 -c datapower -- \\\n  curl -k -s -u \"admin:admin\" \\\n  https://localhost:5554/mgmt/config/apiconnect/APICollection \\\n  | jq '.APICollection | length'    # 0 == gateway is serving nothing"),
          p("Validation criteria before patching: all 6 peering objects present (api-probe, distributed-variables, gwd, rate-limit, ratelimit-module, subs), LinkStatus ok, PendingUpdates 0, Priority never -1, one Primary: yes per object. Use domain 'apiconnect' on OCP, 'default' on standalone OVA — wrong domain returns an empty body."),
        ]},
        { author: M.omar, at: "2026-05-13T10:30:00Z", body: [ p("Worth stressing: GatewayPeeringClusterStatus and MemberStatus return 'No status retrieved' on a single-pod lab — that's normal, not a fault. They only populate in a real multi-pod cluster, which is where they'd reveal the stale member IPs.") ]},
        { author: M.luke, at: "2026-05-13T11:00:00Z", solution: true, body: [ p("Correct. There's an all-in-one gw-health-check.sh in the module that wraps all of these plus the OCP-level checks (DataPowerService rollout = null, DataPowerMonitor workPending = false) which you can't get from REST and must query with oc.") ]},
      ],
    },

    /* ── LAB-11 ─────────────────────────────────────────────────────────── */
    {
      id: "lab-11", cat: "trouble", module: "LAB-11", level: "Intermediate", minutes: 30,
      title: "Review a customer's pre-patch peering health-check script (the bash subshell trap)",
      author: M.luke, created: "2026-05-14T16:00:00Z", lastAt: "2026-05-27T09:30:00Z",
      tags: ["bash", "gateway-peering", "scripting", "code-review", "jq"],
      replies: 8, views: 760, solved: true,
      posts: [
        { author: M.luke, at: "2026-05-14T16:00:00Z", body: [
          p("A customer wrote their own pre-patch checker (8 peering objects incl. tms/tms-external, CA cert instead of -k, jq throughout — genuinely better than our examples in places). But it had one critical bug worth learning from: a 'pipe into while read' loop runs in a subshell, so a POD_HEALTH=false set inside it is lost when the loop ends — failed validations are silently ignored."),
          c("bash", "# BROKEN — runs in a subshell, POD_HEALTH change is lost:\necho \"$ENTRIES\" | jq -c '.[]' | while read -r entry; do\n  POD_HEALTH=false\ndone\n\n# FIX — process substitution keeps the loop in the current shell:\nwhile read -r entry; do\n  POD_HEALTH=false\ndone < <(echo \"$ENTRIES\" | jq -c '.[]')"),
          p("Two more notes: don't hardcode the DataPowerService name ('gwv6') — iterate all items so multi-gateway clusters aren't skipped; and 'set -e' can exit early when a jq filter legitimately returns non-zero (no match), so prefer 'set -uo pipefail' and handle errors per-check."),
        ]},
        { author: M.matt, at: "2026-05-15T08:40:00Z", solution: true, body: [ p("The subshell bug is the one to internalise — it fails open, which is the worst kind of bug in a pre-patch gate: the script reports healthy while a peering object is actually down. Process substitution (or a here-string) is the standard fix.") ]},
      ],
    },

    /* ── LAB-12 ─────────────────────────────────────────────────────────── */
    {
      id: "lab-12", cat: "labs", module: "LAB-12", level: "Beginner", minutes: 30,
      title: "Ship DataPower syslog to Visual Syslog over TCP and prove end-to-end delivery",
      author: M.luke, created: "2026-05-16T11:30:00Z", lastAt: "2026-05-26T14:00:00Z",
      tags: ["datapower", "syslog", "logging", "pktmon", "tcp"],
      replies: 7, views: 880, solved: false,
      posts: [
        { author: M.luke, at: "2026-05-16T11:30:00Z", body: [
          p("Goal: deliver syslog from DataPower 10.6.0.4 to Visual Syslog on a Windows host over TCP/514 and actually verify it arrives. On DataPower, add a Log Target of type Syslog TCP with the remote address, port 514, an explicit local address, facility user — then restart the target (Disable → Save → Enable → Save)."),
          p("Generate a uniquely-tagged test event from the WebGUI (Troubleshooting → Generate Log Event) so you can grep for it, then capture on the Windows side with pktmon to prove the packets are on the wire independent of the Visual Syslog app:"),
          c("powershell", "New-NetFirewallRule -DisplayName \"Allow-Syslog-From-DataPower\" -Direction Inbound `\n  -LocalPort 514 -Protocol TCP -Action Allow -RemoteAddress 192.168.1.199\npktmon start --capture --pkt-size 0\n# (generate the DPTEST event on DataPower)\npktmon stop; pktmon format PktMon.etl -o pktmon.txt"),
          c("text", "# from the DataPower CLI, confirm reachability:\ntest tcp-connection 192.168.1.25 514"),
          p("Decision tree: DPTEST packets in pktmon but nothing in the app → Visual Syslog filters / not bound to 514. No packets at all → re-check the Log Target local address, restart the target, re-capture. Suspect the firewall → add the temporary allow rule above and re-test."),
        ]},
      ],
    },

    /* ── LAB-13 ─────────────────────────────────────────────────────────── */
    {
      id: "lab-13", cat: "labs", module: "LAB-13", level: "Intermediate", minutes: 45,
      title: "Your first MPGW: bidirectional application/jose passthrough",
      author: M.luke, created: "2026-05-18T10:00:00Z", lastAt: "2026-05-30T09:00:00Z",
      tags: ["datapower", "mpgw", "jose", "jws", "passthrough"],
      replies: 9, views: 1240, solved: true,
      posts: [
        { author: M.luke, at: "2026-05-18T10:00:00Z", body: [
          p("Question we get a lot: does DataPower API Gateway proxy application/jose (the RFC 7515 JWS/JWE compact type) without mangling it? This module replicates the test: a Multi-Protocol Gateway on port 8001, request/response type Pass through, processing policy that does nothing but Results — fronting a tiny Python mock backend that echoes Content-Type: application/jose."),
          c("bash", "curl -v http://127.0.0.1:8001 \\\n  -H \"Content-Type: application/jose\" \\\n  -d \"header.payload.signature\""),
          c("text", "< HTTP/1.1 200 OK\n< X-Backside-Transport: OK OK\n< Content-Type: application/jose      # returned intact\n< X-Global-Transaction-ID: 880862e36a1d54ad00001691\nmock.jose.payload                     # body unmodified"),
          p("Result: the gateway accepts, forwards and returns application/jose untouched in both directions, no config needed. The conditions for clean passthrough: NO Parse policy on the body, NO Validate Message policy enforcing MIME/schema, and no Content-Type override on the invoke. Applies across 10.0.x and 10.5.x/10.6.x firmware."),
        ]},
        { author: M.sasha, at: "2026-05-19T13:20:00Z", solution: true, body: [ p("Confirmed the same with application/jose+json (the JSON-serialized variant). As long as you don't bolt a Parse/Validate onto the assembly, the gateway treats it as an opaque body. The moment you add Parse, it tries to materialize it and you're in a different world.") ]},
      ],
    },

    /* ── LAB-14 ─────────────────────────────────────────────────────────── */
    {
      id: "lab-14", cat: "labs", module: "LAB-14", level: "Intermediate", minutes: 30,
      title: "Cleanly remove a User-Defined Policy (UDP) via a gateway extension",
      author: M.luke, created: "2026-05-19T09:00:00Z", lastAt: "2026-05-31T10:10:00Z",
      tags: ["datapower", "udp", "gateway-extension", "cloud-manager"],
      replies: 10, views: 1090, solved: true,
      posts: [
        { author: M.luke, at: "2026-05-19T09:00:00Z", body: [
          p("Deploying a UDP is well documented; removing one is not. The trick people miss: the removal is NOT a gwd_extension (that's JSON). It's a plain DataPower .cfg file wrapped in a gateway extension zip with manifest type 'dp-config'. First delete any existing extension in Cloud Manager, then build the removal package."),
          c("text", "# remove-udp.cfg\ntop; configure terminal\napic-gw-service\n  no user-defined-policies udp-basic_1.0.0\nexit"),
          c("json", "{\n  \"extension\": {\n    \"properties\": { \"deploy-policy-emulator\": false },\n    \"files\": [\n      { \"filename\": \"remove-udp.cfg\", \"deploy\": \"immediate\", \"type\": \"dp-config\" }\n    ]\n  }\n}"),
          p("Zip manifest.json + remove-udp.cfg at the root (no subfolder), upload it as the new Gateway Extension under Topology → Gateway Services, then restart the API Connect Gateway Service object so the command applies on boot. Verify with 'show user-defined-policies' in the apic-gw-service context — the policy should be gone. Tested on 10.0.8.x LTS + DataPower 10.6.0.x."),
        ]},
        { author: M.devon, at: "2026-05-20T12:00:00Z", solution: true, body: [ p("The 'dp-config' vs 'gwd_extension' distinction is the whole ballgame — using gwd_extension for a .cfg throws a deployment error. And yes, you must delete the existing extension first or the new removal one doesn't apply cleanly.") ]},
      ],
    },

    /* ── LAB-15 ─────────────────────────────────────────────────────────── */
    {
      id: "lab-15", cat: "labs", module: "LAB-15", level: "Advanced", minutes: 50,
      title: "Field-level Validate errors: why you need custom GatewayScript",
      author: M.luke, created: "2026-05-21T15:00:00Z", lastAt: "2026-06-04T08:30:00Z",
      tags: ["datapower", "validate", "gatewayscript", "assembly", "parse"],
      replies: 11, views: 1330, solved: true,
      posts: [
        { author: M.luke, at: "2026-05-21T15:00:00Z", body: [
          p("Confirmed limitations of the Validate policy on DataPower API Gateway 10.0.8.8: its 422 names the constraint (maxLength 20, got 22) but never the field; it reports only the first violation; and an assembly Catch block does NOT intercept its error — the policy terminates the flow itself. Also, Validate needs parsed input, so a Parse policy must come first or you get 'Instance is neither parsed XML, parsed JSON nor parsed GraphQL'."),
          p("If you need field-named errors and all failures in one response, the supported path is a Parse policy followed by a custom GatewayScript policy doing the validation yourself:"),
          c("javascript", "var body = context.get('request.body');\nvar errors = [];\nif (body && typeof body.someID === 'string' && body.someID.length > 20)\n  errors.push('someID exceeds maximum length of 20 (got ' + body.someID.length + ')');\nif (body && !/^[0-9]+$/.test(body.someCode))\n  errors.push('someCode must be numeric (pattern ^[0-9]+$)');\nif (errors.length) {\n  context.set('message.status.code', 400);\n  context.message.header.set('Content-Type', 'application/json');\n  context.message.body.write(JSON.stringify({ responseCode: '2001000', responseMessage: errors.join('; ') }));\n}"),
          p("This collects every field error before responding, so one request with two bad fields returns one message listing both — which the default Validate policy can't do. Parse must be upstream for context.get('request.body') to return a materialized object rather than a NodeList."),
        ]},
        { author: M.matt, at: "2026-05-22T09:00:00Z", solution: true, body: [ p("Comparison that settles the debate: Validate (default) → no field name, first error only. Validate+Catch+GatewayScript → Catch never fires. Custom GatewayScript → field names, all errors, custom format. If the requirement is a specific error contract, GatewayScript is the only one that meets it.") ]},
      ],
    },

    /* ── LAB-16 ─────────────────────────────────────────────────────────── */
    {
      id: "lab-16", cat: "trouble", module: "LAB-16", level: "Advanced", minutes: 60,
      title: "Reconfigure Management S3 backup when the operator blocks the change",
      author: M.priya, created: "2026-05-23T10:00:00Z", lastAt: "2026-06-05T12:00:00Z",
      tags: ["s3", "backup", "postgres", "patroni", "pgcluster", "webhook"],
      replies: 9, views: 1010, solved: true,
      posts: [
        { author: M.priya, at: "2026-05-23T10:00:00Z", body: [
          p("On recent v10, the operator health-checks the cluster before letting you add/change/remove S3 backup config on the management subsystem (production profiles, 3 replicas). If it's unhealthy you get 'databaseBackup configuration can not be changed at this time'. The fix: make the pgcluster healthy first — the primary postgres pod must be using the PVCs that match the initial pgcluster name."),
          c("bash", "export NAMESPACE=<your-namespace>\nexport INITIAL_PGCLUSTER_NAME=$(kubectl -n $NAMESPACE get pgcluster | awk 'NR==2{print $1}')\nkubectl -n $NAMESPACE get pvc $INITIAL_PGCLUSTER_NAME $INITIAL_PGCLUSTER_NAME-wal\nkubectl exec -it <postgres-pod> -n $NAMESPACE -- patronictl list   # all same TL, Lag 0"),
          p("If a Replica is using the right PVCs, failover to it with patronictl so it becomes primary; wait for all members to catch up (same timeline, zero lag). If NO pod uses those PVCs, prefer the backup/restore method to recreate a primary on the correct PVCs before touching S3."),
          c("bash", "patronictl failover    # choose the replica that holds the INITIAL_PGCLUSTER PVCs, then y"),
          p("Once healthy, set the objstore settings + the MinIO cert via 'apicup certs set' (NOT subsys set), re-install, and finally flip restartDB.Accept to true to accept the DB restart the operator asks for."),
        ]},
        { author: M.priya, at: "2026-05-23T10:12:00Z", solution: true, body: [
          p("Last resort if restore won't reattach the PVCs: the temporary-cluster method via the pgo client — enable ENABLE_PGO_CLIENT, scale the operator to 0, pg_dump lur+apim as a safety net, delete the pgcluster with --keep-data --keep-backups, recreate a temp cluster onto the existing primary PVC, then recreate the original with --restore-from the temp. Intrusive — keep those SQL dumps safe."),
        ]},
      ],
    },

    /* ── LAB-17 ─────────────────────────────────────────────────────────── */
    {
      id: "lab-17", cat: "trouble", module: "LAB-17", level: "Intermediate", minutes: 40,
      title: "Decode the 'Published-failed' (feedback_2) state in APIC 10.0.8.x",
      author: M.wenqian, created: "2026-05-25T09:00:00Z", lastAt: "2026-06-08T11:00:00Z",
      tags: ["feedback_2", "published-failed", "datapower", "gateway-status", "apim"],
      replies: 17, views: 2420, solved: true, pinned: true,
      posts: [
        { author: M.wenqian, at: "2026-05-25T09:00:00Z", body: [
          p("The 'published-failed' Product status and a 'High' Gateway Service Status are a new feedback_2 feature in APIC 10.0.8.x / DP 10.6.0.x — not necessarily a broken publish. It means the API published, but the gateway reported an error while compiling the catalog collection config sequence. It reports only the FIRST error and keeps reporting until that resource is fixed/retired."),
          p("Right approach: download the gateway processing logs from API Manager → Manage → <catalog> → Catalog Settings → Gateway Services → ⋯ → View Status / Download logs, then grep [error] only (ignore [warn]/[info]). It usually narrows to one API/Product with an invalid definition — fix and republish, or retire it."),
          p("Common real cause: an OpenAPI 3.0 limitation the gateway rejects. The fix is often adding the compatibility flag to the offending API:"),
          c("yaml", "compatibility:\n  suppress-limitation-errors: true"),
        ]},
        { author: M.wenqian, at: "2026-05-25T09:15:00Z", solution: true, body: [
          p("Last-resort workaround (confirm with Dev first): disable the feedback_2 UI behaviour. On OVA/physical DP, drop an env.yaml in the apiconnect domain local: directory and restart the gateway service object; on containers, mount it via a configMap referenced from additionalDomainConfig so it persists."),
          c("yaml", "# env.yaml\nSEND_LATEST_PROCESS_EVENT_2: \"false\"\nSEND_CLOUD_LATEST_PROCESS_EVENT_2: \"false\""),
          c("text", "top;co;apic;admin disabled;exit;apic;admin enabled;exit   # restart on every GW node"),
        ]},
        { author: M.matt, at: "2026-05-26T10:00:00Z", body: [ p("Heads up: from DP 10.6.0.6/10.6.0.7 the env.yaml flags alone no longer fully work — there's a newer feedback_2_1 flag and a webhook supported_feature to clear via a proper DRR. If existing products are stuck published-success/failed, you may also need to clear the resource_service_status table on the mgmt-db primary. Tracked in APICON-9160.") ]},
      ],
    },

    /* ── LAB-18 ─────────────────────────────────────────────────────────── */
    {
      id: "lab-18", cat: "trouble", module: "LAB-18", level: "Advanced", minutes: 75,
      title: "Troubleshoot APIM→Gateway synchronization (gateway focus): sent vs processed vs queued",
      author: M.matt, created: "2026-05-27T08:30:00Z", lastAt: "2026-06-09T14:30:00Z",
      tags: ["apim", "gateway-sync", "webhook", "taskmanager", "apicops", "drr"],
      replies: 21, views: 2860, solved: true,
      posts: [
        { author: M.matt, at: "2026-05-27T08:30:00Z", body: [
          p("In v10 the webhook-sending lives in the taskmanager pod, not apim — so grep there. The gateway processing status table shows each event as Queued, Sent, or Processed, and which one tells you where the pipeline is stuck:"),
          c("bash", "kt logs management-taskmanager-xxxxx --since=10m | grep \"webhook: s\""),
          p("SENT but not Processed = taskmanager delivered it and got a 2xx, but the gateway hasn't confirmed. Pull gwd-log.log (generate_postmortems.sh --diagnostic-gateway) and search [error] / 'Failed to compile' / 'Unable to refresh gateway'. Typically one product won't compile (e.g. missing override rate-limit definition). Fix or remove the source, then force a DRR so the gateway resumes that catalog."),
          c("text", "apic2dp:lib:index: Failed to compile Product atlas-...-apigw:1.1.1: 0x0890000bf\nUnable to refresh gateway. Error: API <id> does not contain an override rate limit definition."),
          p("QUEUED (not Sent) = taskmanager never sent it — look at nats/stan cluster pods (connect timeouts, a stancluster pod stuck 'Completed'), or a webhook stuck offline_configured. Throttling (200+ events Sent, state online_throttled) kicks in when the gateway stops acking; it clears itself once the gateway catches up."),
        ]},
        { author: M.matt, at: "2026-05-27T08:45:00Z", solution: true, body: [
          p("The nasty one: cloud webhook stuck offline_resync with 'Cannot read property id of null' on the reconfigure task. It means the webhook's gateway_service_url points at a gateway service that no longer exists. Compare service_url (gateway_service object) vs gateway_service_url (webhook) in apicops debug:info — if they mismatch, fix it ON THE MASTER postgres only, then watch the reconfigure task reach completed:"),
          c("sql", "update webhook set gateway_service_url='<correct service_url>'\n  where id='<webhook_id>';"),
          c("bash", "apicops tasks:get <reconfigure_task_id>          # wait for state: completed\napicops webhook-subscriptions:update -s online -w <webhook_id>"),
        ]},
      ],
    },

    /* ── LAB-19 ─────────────────────────────────────────────────────────── */
    {
      id: "lab-19", cat: "trouble", module: "LAB-19", level: "Intermediate", minutes: 35,
      title: "Read an end-to-end gateway processing status trace (one publish, three pods)",
      author: M.matt, created: "2026-05-28T10:00:00Z", lastAt: "2026-06-06T09:00:00Z",
      tags: ["gateway-sync", "events", "tracing", "request-id", "gwd-log"],
      replies: 8, views: 940, solved: false,
      posts: [
        { author: M.matt, at: "2026-05-28T10:00:00Z", body: [
          p("Companion to LAB-18: follow a single product publish end-to-end across pods by tracking one request id and one subscriber-event id. The apim pod logs the POST publish-draft-product and creates a Subscriber Event; the taskmanager logs 'webhook: sending successful' with the same request-id and event-id; gwd-log.log shows the gateway validate + process that event; then apim logs the last-processed-event callback. The same two IDs thread through all four."),
          c("text", "# apim pod (publish + event creation)\naudit [f7e7bbc4...] START >>> [POST] .../publish-draft-product\nCreated internal resource \"Subscriber Event\" '3434e907-1bf0-4cb8-a3c0-7654bedd2b2a'\n\n# taskmanager pod (send)\napim:webhook:audit [...] webhook: sending successful, status=202,\n  event-id=3434e907-..., event-type=update, filter=product_lifecycle"),
          c("text", "# gwd-log.log (receive + process + ack)\n[apic-gw-service] Start of validation of batch event. ID: 3434e907-...\n[apic-gw-service] Sending latest processed event for webhookid ..., event_id: 3434e907-...\n# apim pod (callback)\n[POST] .../last-processed-event  ->  [201]   # gateway confirmed processed"),
          p("When something breaks, this is how you localize it: if the trace stops after taskmanager 'sending successful', the gateway received it but didn't process — go to gwd-log.log. If there's no taskmanager send line at all, it never left apim — go to nats/stan. The IDs are your thread through the whole synchronization machine."),
        ]},
      ],
    },

    /* ── LAB-20 ─────────────────────────────────────────────────────────── */
    {
      id: "lab-20", cat: "cicd", module: "LAB-20", level: "Advanced", minutes: 60,
      title: "Config Sync 1.2.7: forward & reverse catalog sync for DR failover/failback",
      author: M.luke, created: "2026-06-08T09:00:00Z", lastAt: "2026-06-11T10:00:00Z",
      tags: ["config-sync", "disaster-recovery", "catalog", "reverse-sync", "scripting"],
      replies: 6, views: 640, solved: true,
      posts: [
        { author: M.luke, at: "2026-06-08T09:00:00Z", body: [
          p("apic-configsync 1.2.7 is a single stateless Go binary that replicates consumer-side catalog objects (consumer orgs, members, active applications, subscriptions, credentials, and optionally products/APIs) from a SOURCE to a TARGET management server. It's diff-based: it compares updated_at and tracks a metadata.source_id on target objects, so it only replicates real changes. All config is via environment variables."),
          p("Reverse sync is a first-class, documented feature — you just swap which cluster is SOURCE and which is TARGET. The constraint: reverse sync requires both clusters at the same Version.Release.Milestone (fix-pack differences OK, cross-VRM not). For a Prod↔DR pair both on 10.0.8.5, that's satisfied."),
          p("Recommended layout: one shared config.env, a forward_sync.sh (Prod→DR, scheduled) and a reverse_sync.sh (DR→Prod, run once at failback). Map the source/target env vars from the shared file:"),
          c("bash", "source ./config.env\nexport SOURCE_MGMT_SERVER=\"$PROD_MGMT_SERVER\"  SOURCE_ORG=\"$PROD_ORG\"  SOURCE_CATALOG=\"$PROD_CATALOG\"\nexport TARGET_MGMT_SERVER=\"$DR_MGMT_SERVER\"    TARGET_ORG=\"$DR_ORG\"    TARGET_CATALOG=\"$DR_CATALOG\"\n./apic-configsync"),
          p("Watch-outs: reverse sync propagates ALL DR changes, not just new apps (no selective filtering exists); disabled applications and their subscriptions are excluded by design in both directions; and it is NOT a backup tool — analytics, portal config and OIDC tokens are not replicated. Stop the forward schedule before running a reverse/failback."),
        ]},
        { author: M.marco, at: "2026-06-09T08:30:00Z", solution: true, body: [ p("The failback runbook in the module is the part to follow exactly: 1) stop forward sync, 2) document the apps created in DR, 3) run reverse_sync.sh, 4) verify Prod has them, 5) confirm Prod-native disabled apps are untouched, 6) resume forward sync. Validate in non-prod first — IBM doesn't guarantee the disabled-app behaviour on paper.") ]},
      ],
    },

    /* ── LAB-21 ─────────────────────────────────────────────────────────── */
    {
      id: "lab-21", cat: "cicd", module: "LAB-21", level: "Intermediate", minutes: 30,
      title: "Capture DataPower debug logs on Argo CD-managed pods (without the change being healed away)",
      author: M.omar, created: "2026-06-09T11:00:00Z", lastAt: "2026-06-11T16:00:00Z",
      tags: ["argo-cd", "gitops", "datapower", "debug-logs", "self-heal"],
      replies: 5, views: 480, solved: true,
      posts: [
        { author: M.omar, at: "2026-06-09T11:00:00Z", body: [
          p("If DataPower runs under Argo CD with auto-sync + self-heal, any manual change you make to log levels is reverted within seconds — Argo sees the drift and heals the pod back to Git. Replicated this with kind + Argo CD: delete a managed resource and it's recreated immediately. So to capture full debug logs you must shield the change first."),
          p("Procedure: in the Argo CD UI for the Gateway app, App Details → Sync Policy → uncheck Enable Auto-Sync. Then raise logging to debug and reproduce, capture the error report, and re-enable auto-sync so Argo heals the pods back to the production log level (notice)."),
          c("text", "sw apiconnect\ntop; config;\nlogging-target \"default-log\"\n  local-log-level debug\nexit\n# reproduce, then:\nsave error-report"),
          p("Verify with 'show logging-target default-log' before reproducing. Re-enabling auto-sync afterwards is the cleanup step — Argo detects the debug setting as drift and restores notice automatically, so you never leave a production gateway noisy."),
        ]},
        { author: M.marco, at: "2026-06-10T09:00:00Z", solution: true, body: [ p("Unchecking auto-sync (rather than editing Git) is the right call for a one-off capture — it's reversible in two clicks and you don't pollute the repo history with a debug commit you'd have to revert. Just don't forget to re-enable it.") ]},
      ],
    },

    /* ── LAB-22 ─────────────────────────────────────────────────────────── */
    {
      id: "lab-22", cat: "labs", module: "LAB-22", level: "Beginner", minutes: 20,
      title: "Run more than one ESXi management network on a single host",
      author: M.sasha, created: "2026-05-29T10:00:00Z", lastAt: "2026-06-02T08:00:00Z",
      tags: ["esxi", "networking", "dcui", "management-network"],
      replies: 4, views: 410, solved: true,
      posts: [
        { author: M.sasha, at: "2026-05-29T10:00:00Z", body: [
          p("Yes — multiple management networks can be set up and used simultaneously on ESXi, and the DCUI can assign the Management Network to a specific NIC. Quick proof: with three management networks configured, remove vmnic0 from vSwitch0 (which makes vmk0/vmk1 unreachable), then reassign via the console."),
          c("text", "# at the ESXi console (DCUI):\nF2  ->  enter root credentials  ->  F2\nConfigure Management Network  ->  (select the NIC, e.g. vmnic0)  ->  Enter\nEsc  ->  confirm save & restart  ->  Y"),
          p("After saving, DCUI shows the Management Network reassigned to the chosen vmnic and the host becomes reachable again on that interface. Useful in the home lab when you want a separate management path that survives pulling a NIC out of the primary vSwitch."),
        ]},
      ],
    },

    /* ── LAB-23 ─────────────────────────────────────────────────────────── */
    {
      id: "lab-23", cat: "qa", module: "LAB-23", level: "Intermediate", minutes: 20,
      title: "WebSocket on API Connect: what's actually supported (WSS, binary frames, streaming)?",
      author: M.devon, created: "2026-05-31T09:00:00Z", lastAt: "2026-06-07T13:00:00Z",
      tags: ["websocket", "wss", "datapower", "limitations", "streaming"],
      replies: 12, views: 1180, solved: true,
      posts: [
        { author: M.devon, at: "2026-05-31T09:00:00Z", body: [
          p("Summarizing a long support case so nobody re-treads it. Q: can APIC expose a native wss:// endpoint and connect to a wss:// backend? A: APIC supports the WebSocket UPGRADE via an HTTPS URL — not a direct wss:// scheme on front/back. The upgrade is a GET, so the handler must allow GET; actions placed before the websocket-upgrade action run during the upgrade, actions after it do not (the transaction ends when either side closes)."),
          p("The bigger finding: DataPower's WebSocket implementation currently supports TEXT frames (Opcode: Text) only — BINARY frames (Opcode: Binary) are NOT forwarded back to the client. In the case, a Vertex AI bidi (binary) stream upgraded fine (HTTP 101, bytes received) but the binary frames never reached the client, while a text echo endpoint worked end to end."),
          c("text", "# successful text upgrade in the gateway log:\nsource-https(...): WebSocket upgrade request is successful.\n[apigw] HTTP response code 101 for 'wss backend'\n# ...but binary Opcode frames are not relayed to the client"),
        ]},
        { author: M.matt, at: "2026-06-01T10:00:00Z", solution: true, body: [ p("So the practical guidance: APIC WebSocket is fine for text-based bidirectional messaging via the websocket-upgrade policy over HTTPS, but don't design a binary streaming use case (e.g. live video / binary LLM bidi) on it today. A doc defect was opened to spell out the text-only limitation on the WebSocket policy page.") ]},
      ],
    },

    /* ── LAB-24 ─────────────────────────────────────────────────────────── */
    {
      id: "lab-24", cat: "qa", module: "LAB-24", level: "Beginner", minutes: 15,
      title: "IBM Support quick reference: opening cases, severities, must-gather",
      author: M.priya, created: "2026-06-02T09:00:00Z", lastAt: "2026-06-07T09:00:00Z",
      tags: ["ibm-support", "case-management", "severity", "must-gather", "reference"],
      replies: 3, views: 520, solved: false,
      posts: [
        { author: M.priya, at: "2026-06-02T09:00:00Z", body: [
          p("Reference card for working IBM cases on APIC/DataPower. Severities: Sev 1 = system/service down (24x7); Sev 2 = severely limited; Sev 3 = usable, minor impact; Sev 4 = how-to/inquiry. Open the case online via the IBM Support site BEFORE phoning — it speeds routing — and put one issue per case so it lands with the right team."),
          p("Must-gather to attach up front so you don't lose a round-trip: when it started, what's happening and the scope, what changed (any upgrade/config change), what you've already tried, business impact, clear repro steps, and exact versions/patch levels (APIC, DataPower firmware, OS, DB). For appliances, the machine type + 7-digit serial."),
          p("Self-help first: search the IBM Knowledge base, ask in the TechXchange Community, and check the Software Product Compatibility Reports. Sev-1 after hours: open online, describe impact, set severity 1. If it stalls, use the Escalate button or request a managed escalation."),
        ]},
      ],
    },

    /* ── LAB-25 ─────────────────────────────────────────────────────────── */
    {
      id: "lab-25", cat: "labs", module: "LAB-25", level: "Intermediate", minutes: 45,
      title: "Scrape APIC + DataPower metrics into Prometheus with Trawler (and why it's not IBM-supported)",
      author: M.luke, created: "2026-06-12T09:00:00Z", lastAt: "2026-06-13T10:00:00Z",
      tags: ["trawler", "prometheus", "metrics", "datapower", "grafana", "observability"],
      replies: 4, views: 360, solved: true,
      posts: [
        { author: M.luke, at: "2026-06-12T09:00:00Z", body: [
          p("Trawler is an IBM open-source metrics exporter (github.com/IBM/apiconnect-trawler) that runs inside the same Kubernetes cluster as API Connect and exposes metrics from every subsystem — Gateway/DataPower, Management, Analytics, Portal — in standard Prometheus format. It pulls DataPower-level metrics over the DataPower REST Management Interface (RMI, port 5554) and platform-level metrics over the API Manager REST API."),
          p("Read this first: Trawler is a community tool, NOT a formally packaged IBM product. It is not covered by standard IBM Support and publishes no supported-version matrix, so compatibility with your APIC version must be validated before any production use. This module stands it up on a lab cluster (k3s + APIC v12.1.0.1) against kube-prometheus-stack."),
          p("Prerequisites: a cluster with APIC deployed; the Prometheus Operator with the ServiceMonitor/PodMonitor CRDs available; RMI enabled on the Gateway pods; and Cloud Manager credentials carrying cloud:view, org:view and provider-org:view (client_credentials, API key, or username/password+realm all work). Grafana is optional — it ships with the Helm chart."),
          c("bash", "# pre-flight: confirm the DataPower RMI is enabled on the gateway pods\nkubectl get datapowerservice -n <gateway-namespace> -o yaml | grep restManagement\n\n# if you don't already have Prometheus + Grafana in-cluster:\nhelm install kube-prometheus-stack prometheus-community/kube-prometheus-stack"),
          p("Trawler deploys via Kustomize from the sample YAML in the repo's deployment folder. Customise these before applying: config.yaml (namespace pointers + which subsystem collectors to enable), secret-mgmt.yaml (Cloud Manager creds), secret-mgmt-org.yaml (provider-org creds), secret-dp.yaml (DataPower creds), and kustomization.yaml (target namespace; uncomment servicemonitor.yaml + service.yaml for the Prometheus Operator model)."),
          c("bash", "kubectl apply -k .\n\n# for the Operator model, let it discover ServiceMonitors outside the Helm release labels:\nhelm upgrade kube-prometheus-stack prometheus-community/kube-prometheus-stack \\\n  --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false"),
        ]},
        { author: M.luke, at: "2026-06-12T09:15:00Z", solution: true, body: [
          p("Two caveats that decide whether you can rely on this. (1) Support scope: because Trawler is community-maintained, treat it as best-effort observability, not a supported monitoring stack — pin the image, test on every APIC upgrade, and keep an OpenTelemetry path in mind for anything that must be supported. (2) Dashboards: IBM does not ship pre-built Grafana dashboards for APIC 10.0.8.x LTS, so you build them by hand against the exposed metric names once Prometheus is scraping."),
          p("Reference set kept in the module: repo github.com/IBM/apiconnect-trawler, plus its docs/install.md, docs/metrics.md and docs/faq.md; the APIC 10.0.8 LTS pages on managing platform REST API keys and enabling OpenTelemetry; and the IBM Support scope policy (node/7228884) for exactly what 'community tool' means in practice."),
        ]},
      ],
    },
    /* ── LAB-26 ─────────────────────────────────────────────────────────── */
    {
      id: "lab-26", cat: "trouble", module: "LAB-26", level: "Intermediate", minutes: 25,
      title: "Does the expiring Microsoft UEFI Secure Boot certificate (June 2026) affect APIC OVA deployments?",
      author: M.luke, created: "2026-06-09T10:00:00Z", lastAt: "2026-06-16T09:30:00Z",
      tags: ["secure-boot", "uefi", "ova", "vmware", "esxi", "bios"],
      replies: 3, views: 210, solved: true, pinned: true,
      posts: [
        { author: M.luke, at: "2026-06-09T10:00:00Z", body: [
          p("A customer (APIC 10.0.5.4 on OVA/vSphere) flagged the upcoming expiry of the Microsoft 'UEFI CA 2011' Secure Boot signing certificate on June 27, 2026 — citing the Red Hat and Broadcom/VMware advisories — and asked two things: (Q1) do the APIC OVA servers use UEFI Secure Boot, and (Q2) will they be affected when the certificate expires?"),
          p("Short answer to both: no. For the expiry to affect a VM at all, TWO conditions must both be true — the VM is on EFI firmware (not legacy BIOS) AND Secure Boot is explicitly enabled. The APIC OVA satisfies neither: it ships as VM hardware version 10 (ESXi 5.5-compatible), a legacy BIOS template, and IBM's VMware docs never mention UEFI/EFI/Secure Boot."),
          p("You can verify it yourself on the ESXi host — scan every VMX for a firmware key; the '-L' flag lists files that do NOT contain 'efi', so all BIOS VMs (including the APIC ones) show up:"),
          c("bash", "find /vmfs/volumes/ -name \"*.vmx\" -print0 | xargs -0 grep -L \"efi\""),
        ]},
        { author: M.luke, at: "2026-06-09T10:20:00Z", solution: true, body: [
          p("Confirmed three ways: IBM KC (no Secure Boot in any VMware prerequisite), VMX inspection (no firmware = \"efi\" entry on the APIC VMs), and the vSphere Client (VM Options › Boot Options › Firmware = BIOS, with the title bar reading 'ESXi 5.5 virtual machine')."),
          p("And even in the hypothetical where Secure Boot WERE enabled: Broadcom KB 423893 is explicit that VMs keep booting after the certificate expires — the only impact is losing the ability to apply future Secure Boot DB/DBX updates, not a boot failure. IBM has not issued an APIC-specific advisory for this event. Full write-up, references and the recommended audit steps are in the lab module."),
        ]},
        { author: M.matt, at: "2026-06-12T11:00:00Z", body: [ p("Ran the VMX scan across all three ESXi hosts here — every APIC node (mgmt/analytics/portal) showed up in the grep -L output, so all BIOS. Good to have the one-liner to hand the VMware team for sign-off.") ]},
      ],
    },
  ];

  // Real counts derived from the actual content — no inflated figures.
  const STATS = {
    members: 1,                                                  // only Luca Cappelletti
    online: 1,                                                   // you, right now
    posts: THREADS.reduce((n, th) => n + th.posts.length, 0),    // actual posts in the forum
    solved: THREADS.filter((th) => th.solved).length,           // actual solved threads
  };

  const TRENDING_TAGS = [
    "datapower", "apic-v10", "2dcdr", "gateway-peering", "openshift",
    "feedback_2", "ova", "upgrade", "gatewayscript", "config-sync",
    "websocket", "apicup", "argo-cd", "esxi", "secure-boot",
  ];

  window.FORUM_DATA = { CATEGORIES, THREADS, MEMBERS: M, STATS, TRENDING_TAGS };
})();
