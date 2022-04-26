package com.esir.resiot;

import javax.websocket.RemoteEndpoint;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import org.eclipse.jetty.util.log.Log;
import org.eclipse.jetty.util.log.Logger;

import java.util.Arrays;

public class ThreadChenillard extends Thread {
    private static final Logger LOG = Log.getLogger(Websocket.class);
    private static final GsonBuilder builder = new GsonBuilder();

    private RemoteEndpoint.Async remote;
    private volatile boolean running = false;
    double speed = 1;
    int direction = 1;
    int activeLed = -1;

    public ThreadChenillard(RemoteEndpoint.Async remote){
        this.remote = remote;
    }

    public void changeThreadState() {
        LOG.info("Changing chaser state to "+this.running);
        this.running = !(this.running);
    }

    public void changeChaserSpeed(double speed){
        this.speed = speed;
        LOG.info("Changing chaser speed to "+this.speed);
    }

    public void changeChaserDirection(){
        if(this.direction == 1){
            this.direction = -1;
        }else{
            this.direction = 1;
        }
        LOG.info("Changing chaser direction to "+this.direction);
    }

    @Override
    public void run() {
        while(true) {
            while (running) {
                if(activeLed == -1){ // Cas particulier : initialisation
                    activeLed = 0;
                }else{
                    // TODO : KNX - Eteindre la led d'indice activeLed
                    activeLed += this.direction;
                    if(activeLed < 0) activeLed = 3;
                    if(activeLed > 3) activeLed = 0;
                }

                // TODO : KNX - Allumer la led d'indice activeLed
                Boolean[] LEDs = new Boolean[4];
                Arrays.fill(LEDs, Boolean.FALSE);
                LEDs[activeLed] = true;
                Gson gson = builder.create();
                String toSend = gson.toJson(LEDs);
                remote.sendText(String.valueOf(toSend));
                try {
                    Thread.sleep((long) (250*(1/speed)));
                } catch (InterruptedException ex) {
                    ex.printStackTrace();
                }
            }
        }
    }
}