# FROM lscr.io/linuxserver/openssh-server:latest
# FROM ubuntu:23.10

# RUN apk update
# RUN apk add openssh --no-cache
# RUN apk add openrc --no-cache
# RUN rc-update add sshd

# RUN echo 'PasswordAuthentication yes' >> /etc/ssh/sshd_config
# RUN adduser -h /home/bao -s /bin/sh -D bao
# RUN echo -n 'bao:bun' | chpasswd

# WORKDIR /usr/duck/.dev-container

# CMD [ "sh", "entrypoint.sh"]
# CMD [ "sleep", "infinity" ]

FROM --platform=linux/amd64 mcr.microsoft.com/vscode/devcontainers/base:dev-bullseye

ARG USERNAME=vscode
ARG USER_UID=1000
ARG USER_GID=${USER_UID}

ENV BUN_INSTALL=/bun
RUN sudo mkdir -p ${BUN_INSTALL} \
    && curl -fsSL https://bun.sh/install | bash \
    && chown -R ${USERNAME} /bun

ENV PATH=${BUN_INSTALL}/bin:${PATH}
