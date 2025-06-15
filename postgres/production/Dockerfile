FROM ubuntu:25.10

# ติดตั้ง SSH และ PostgreSQL client
RUN apt-get update && apt-get install -y \
    openssh-server \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# ตั้งค่า SSH
RUN echo 'root:password' | chpasswd
RUN sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config

# เปิด port SSH
EXPOSE 22

# รัน SSH service
CMD ["/usr/sbin/sshd", "-D"]