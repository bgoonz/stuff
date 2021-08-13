FROM gitpod/workspace-base

USER gitpod
SHELL ["/bin/bash", "-c"]

RUN sudo curl -L https://install.perlbrew.pl | bash \
    && echo "source /home/gitpod/perl5/perlbrew/etc/bashrc" >> /home/gitpod/.bashrc \
    && echo "perlbrew use perl-5.34.0" >> /home/gitpod/.bashrc

RUN . /home/gitpod/perl5/perlbrew/etc/bashrc \
    && perlbrew install-cpanm \
    && perlbrew install perl-5.34.0
