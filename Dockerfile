FROM node:0.12.13

RUN echo 'deb http://www.deb-multimedia.org jessie main non-free' >> /etc/apt/sources.list
RUN echo 'deb-src http://www.deb-multimedia.org jessie main non-free' >> /etc/apt/sources.list
RUN apt-get update
RUN apt-get install -y --force-yes deb-multimedia-keyring
RUN apt-get update
RUN apt-get install -y build-essential libmp3lame-dev libvorbis-dev libtheora-dev libspeex-dev yasm pkg-config libfaac-dev libopenjpeg-dev libx264-dev
RUN wget http://ffmpeg.org/releases/ffmpeg-2.7.2.tar.bz2
RUN tar xvjf ffmpeg-2.7.2.tar.bz2
WORKDIR ffmpeg-2.7.2
RUN ./configure --enable-gpl --enable-postproc --enable-swscale --enable-avfilter --enable-libmp3lame --enable-libvorbis --enable-libtheora --enable-libx264 --enable-libspeex --enable-shared --enable-pthreads --enable-libopenjpeg --enable-libfaac --enable-nonfree
RUN make
RUN make install
RUN /sbin/ldconfig

WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install

COPY app.js /usr/src/app/
COPY config.js /usr/src/app/
COPY services /usr/src/app/services

CMD [ "node", "app.js" ]
